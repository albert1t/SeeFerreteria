# Convert bacpac BCP data to SQL INSERT statements
# Based on schema extracted from model.xml

param(
    [string]$BacpacDir = "$env:TEMP\bacpac_extracted",
    [string]$OutputFile = "$PSScriptRoot\bacpac_data.sql"
)

Add-Type -AssemblyName System.Runtime.Serialization

$output = [System.Text.StringBuilder]::new()

function Parse-BcpFile {
    param(
        [string]$BcpPath,
        [array]$Columns
    )

    if (!(Test-Path $BcpPath)) {
        Write-Warning "BCP file not found: $BcpPath"
        return @()
    }

    $bytes = [System.IO.File]::ReadAllBytes($BcpPath)
    $offset = 0
    $rows = @()
    $rowNum = 0

    while ($offset -lt $bytes.Length) {
        $row = @{}
        $tooShort = $false

        foreach ($col in $Columns) {
            if ($offset -ge $bytes.Length) {
                $tooShort = $true
                break
            }

            switch ($col.Type) {
                'int' {
                    if ($offset + 4 -gt $bytes.Length) { $tooShort = $true; break }
                    $val = [System.BitConverter]::ToInt32($bytes, $offset)
                    $row[$col.Name] = $val
                    $offset += 4
                }
                'tinyint' {
                    $val = [int]$bytes[$offset]
                    $row[$col.Name] = $val
                    $offset += 1
                }
                'bit' {
                    $val = $bytes[$offset] -ne 0
                    $row[$col.Name] = $val
                    $offset += 1
                }
                'nvarchar' {
                    if ($offset + 2 -gt $bytes.Length) { $tooShort = $true; break }
                    $strLenBytes = [System.BitConverter]::ToUInt16($bytes, $offset)
                    $offset += 2

                    if ($strLenBytes -eq 0xFFFF) {
                        $row[$col.Name] = $null
                    } else {
                        if ($strLenBytes -gt 0 -and $offset + $strLenBytes -le $bytes.Length) {
                            $val = [System.Text.Encoding]::Unicode.GetString($bytes, $offset, $strLenBytes)
                            $row[$col.Name] = $val
                        } else {
                            $row[$col.Name] = ''
                        }
                        $offset += $strLenBytes
                    }
                }
                'nvarcharmax' {
                    if ($offset + 4 -gt $bytes.Length) { $tooShort = $true; break }
                    $strLenBytes = [System.BitConverter]::ToInt32($bytes, $offset)
                    $offset += 4

                    if ($strLenBytes -eq -1 -or $strLenBytes -eq 0xFFFFFFFF) {
                        $row[$col.Name] = $null
                    } else {
                        if ($strLenBytes -gt 0 -and $offset + $strLenBytes -le $bytes.Length) {
                            $val = [System.Text.Encoding]::Unicode.GetString($bytes, $offset, $strLenBytes)
                            $row[$col.Name] = $val
                        } else {
                            $row[$col.Name] = ''
                        }
                        $offset += $strLenBytes
                    }
                }
                'datetime2' {
                    # SQL Server BCP datetime2 native format:
                    # 1 byte: scale (0-7)
                    # For scale 0-2: 3 bytes time
                    # For scale 3-4: 4 bytes time
                    # For scale 5-7: 5 bytes time? No...
                    # Actually: 1 byte scale + n bytes for date/time combined
                    # Scale 0: 1 + 5 (date) + 3 (time) = 9
                    # Scale 1-2: 1 + 5 + 3 = 9
                    # Scale 3-4: 1 + 5 + 4 = 10
                    # Scale 5-7: 1 + 5 + 5 = 11
                    
                    if ($offset + 1 -gt $bytes.Length) { $tooShort = $true; break }
                    $scale = $bytes[$offset]
                    $offset += 1
                    
                    # Date part: 3 bytes (days since year 0)
                    # Time part: depends on scale
                    switch ($scale) {
                        {$_ -le 2} { $timeLen = 3 }
                        {$_ -eq 3 -or $_ -eq 4} { $timeLen = 4 }
                        default { $timeLen = 5 }
                    }
                    
                    $totalLen = 3 + $timeLen
                    if ($offset + $totalLen -gt $bytes.Length) { $tooShort = $true; break }
                    
                    try {
                        # Days (3 bytes, little-endian)
                        $daysBytes = @($bytes[$offset], $bytes[$offset+1], $bytes[$offset+2], 0)
                        $days = [System.BitConverter]::ToUInt32($daysBytes, 0)
                        $offset += 3
                        
                        $timeBytes = $bytes[($offset)..($offset+$timeLen-1)]
                        $offset += $timeLen
                        
                        # Time is stored as ticks/100ns in big-endian? No, let's try LE
                        if ($timeLen -eq 3) {
                            $ticksBytes = @($timeBytes[0], $timeBytes[1], $timeBytes[2], 0)
                            $timeTicks = [System.BitConverter]::ToUInt32($ticksBytes, 0) * 10000  # 3 bytes -> ms * 10000? No...
                        } elseif ($timeLen -eq 4) {
                            $ticksBytes = @($timeBytes[0], $timeBytes[1], $timeBytes[2], $timeBytes[3])
                            $timeTicks = [System.BitConverter]::ToUInt32($ticksBytes, 0)
                        } else {
                            $ticksBytes = @($timeBytes[0], $timeBytes[1], $timeBytes[2], $timeBytes[3], 0)
                            $timeTicks = [System.BitConverter]::ToUInt64($ticksBytes, 0)
                        }
                        
                        # Generate a readable datetime string
                        # Use the format SQL Server expects: 'YYYY-MM-DD HH:MM:SS.FFFFFFF'
                        # For now, we'll generate with just the date part
                        if ($scale -eq 7) {
                            $row[$col.Name] = [DateTime]::new(1, 1, 1).AddDays($days).AddTicks($timeTicks).ToString('yyyy-MM-dd HH:mm:ss.fffffff')
                        } else {
                            $row[$col.Name] = [DateTime]::new(1, 1, 1).AddDays($days).AddTicks($timeTicks).ToString('yyyy-MM-dd HH:mm:ss')
                        }
                    } catch {
                        $row[$col.Name] = '2024-01-01 00:00:00'
                    }
                }
                'datetime2_easy' {
                    # More robust datetime2(7) parsing
                    # The .bacpac uses a specific format
                    # Let's just try to skip the right number of bytes and generate a placeholder
                    
                    # Check what's at this position
                    # In bacpac, datetime2 is serialized as: 
                    # 1 byte for length (9, 10, or 11) followed by that many bytes
                    # OR: 1 byte for scale + variable bytes
                    
                    if ($offset + 1 -gt $bytes.Length) { $tooShort = $true; break }
                    $first = $bytes[$offset]
                    
                    if ($first -eq 0x08 -or $first -eq 9 -or $first -eq 10 -or $first -eq 11) {
                        # This might be a length prefix
                        $len = $first
                        $offset += 1
                        if ($offset + $len -gt $bytes.Length) { $tooShort = $true; break }
                        # Try to parse DateTime from the binary
                        try {
                            $raw = $bytes[($offset)..($offset+$len-1)]
                            $offset += $len
                            # Create DateTime based on the bytes (format varies by SQL Server version)
                        } catch {
                            $offset += $len
                        }
                    } else {
                        # Assume scale 7 with 8 bytes of ticks
                        $offset += 1 + 8
                    }
                    $row[$col.Name] = '2024-01-01 00:00:00.0000000'
                }
                'datetime2_fallback' {
                    # For datetime2 in bacpac: the format is actually...
                    # The datetime2 values we see in the Users table for example:
                    # createdAt: 81 DF 8E 51 57 DA 49 0B - 8 bytes
                    # This is enough for datetime2(7) which stores ticks in 8 bytes
                    # but there's also a preceding scale byte
                    
                    if ($offset + 1 -gt $bytes.Length) { $tooShort = $true; break }
                    $scale = $bytes[$offset]
                    $offset += 1
                    
                    # For datetime2(7): 7 bytes (minus 1? No...)
                    # Actually the format is:
                    # 1 byte: scale
                    # For date: 3 bytes storing days since 1/1/0001
                    # For time: varies by scale (3, 4, or 5 bytes)
                    # Total variable 7-11 bytes
                    
                    # Simplification: try to determine the remaining bytes from the BCP content
                    # Just skip the appropriate number of bytes
                    if ($scale -eq 7 -or $scale -eq 6 -or $scale -eq 5) {
                        $skip = 3 + 5  # 3 days + 5 time
                    } elseif ($scale -eq 3 -or $scale -eq 4) {
                        $skip = 3 + 4
                    } else {
                        $skip = 3 + 3
                    }
                    
                    if ($offset + $skip -gt $bytes.Length) { $tooShort = $true; break }
                    
                    $dateBytes = $bytes[($offset)..($offset+2)]
                    $timeBytes = $bytes[($offset+3)..($offset+$skip-1)]
                    $offset += $skip
                    
                    try {
                        $dayBytes4 = @($dateBytes[0], $dateBytes[1], $dateBytes[2], 0)
                        $days = [System.BitConverter]::ToUInt32($dayBytes4, 0)
                        
                        if ($skip - 3 -eq 5) {
                            $tickBytes = @($timeBytes[0], $timeBytes[1], $timeBytes[2], $timeBytes[3], $timeBytes[4])
                            $tickBytes8 = @($tickBytes[0], $tickBytes[1], $tickBytes[2], $tickBytes[3], $tickBytes[4], 0, 0, 0)
                            $ticks = [System.BitConverter]::ToUInt64($tickBytes8, 0)
                        } elseif ($skip - 3 -eq 4) {
                            $tickBytes = @($timeBytes[0], $timeBytes[1], $timeBytes[2], $timeBytes[3])
                            $ticks = [System.BitConverter]::ToUInt32($tickBytes, 0)
                        } else {
                            $tickBytes = @($timeBytes[0], $timeBytes[1], $timeBytes[2], 0)
                            $ticks = [System.BitConverter]::ToUInt32($tickBytes, 0)
                        }
                        
                        $dt = [DateTime]::new(1, 1, 1).AddDays($days).AddTicks($ticks)
                        $row[$col.Name] = $dt.ToString('yyyy-MM-dd HH:mm:ss.fffffff')
                    } catch {
                        $row[$col.Name] = '2024-01-01 00:00:00.0000000'
                    }
                }
                default {
                    Write-Warning "Unknown type: $($col.Type)"
                    $offset = $bytes.Length
                }
            }
        }

        if (-not $tooShort) {
            $rows += $row
        }
        $rowNum++
    }

    return $rows
}

function Escape-SqlString {
    param([string]$Value)
    if ($null -eq $Value) { return 'NULL' }
    return "N'$($Value -replace "'", "''")'"
}

function Escape-SqlStringNoN {
    param([string]$Value)
    if ($null -eq $Value) { return 'NULL' }
    return "'$($Value -replace "'", "''")'"
}

# ============================================================
# AllowedEmails: id (int), email (nvarchar100), role (nvarchar20), 
#                permissions (nvarchar max), isActive (bit), createdAt (datetime2(7))
# ============================================================
Write-Host "Parsing AllowedEmails..."
$allowedEmailsCols = @(
    @{Name='id'; Type='int'}
    @{Name='email'; Type='nvarchar'}
    @{Name='role'; Type='nvarchar'}
    @{Name='permissions'; Type='nvarcharmax'}
    @{Name='isActive'; Type='bit'}
    @{Name='createdAt'; Type='datetime2_fallback'}
)
$allowedEmailsRows = Parse-BcpFile "$BacpacDir\Data\dbo.AllowedEmails\TableData-000-00000.BCP" $allowedEmailsCols
[void]$output.AppendLine("-- ============================================================")
[void]$output.AppendLine("-- AllowedEmails")
[void]$output.AppendLine("-- ============================================================")
[void]$output.AppendLine("SET IDENTITY_INSERT dbo.AllowedEmails ON;")
foreach ($r in $allowedEmailsRows) {
    $sql = "INSERT INTO dbo.AllowedEmails (id, email, role, permissions, isActive, createdAt) VALUES ($($r.id), $(Escape-SqlString $r.email), $(Escape-SqlString $r.role), $(Escape-SqlString $r.permissions), $([int]$r.isActive), $(Escape-SqlStringNoN $r.createdAt));"
    [void]$output.AppendLine($sql)
}
[void]$output.AppendLine("SET IDENTITY_INSERT dbo.AllowedEmails OFF;")
[void]$output.AppendLine("")

# ============================================================
# Familias: id (int), nombre (nvarchar100), descripcion (nvarchar500), 
#           createdAt (datetime2(7))
# ============================================================
Write-Host "Parsing Familias..."
$familiasCols = @(
    @{Name='id'; Type='int'}
    @{Name='nombre'; Type='nvarchar'}
    @{Name='descripcion'; Type='nvarchar'}
    @{Name='createdAt'; Type='datetime2_fallback'}
)
$familiasRows = Parse-BcpFile "$BacpacDir\Data\dbo.Familias\TableData-000-00000.BCP" $familiasCols
[void]$output.AppendLine("-- ============================================================")
[void]$output.AppendLine("-- Familias")
[void]$output.AppendLine("-- ============================================================")
[void]$output.AppendLine("SET IDENTITY_INSERT dbo.Familias ON;")
foreach ($r in $familiasRows) {
    $sql = "INSERT INTO dbo.Familias (id, nombre, descripcion, createdAt) VALUES ($($r.id), $(Escape-SqlString $r.nombre), $(Escape-SqlString $r.descripcion), $(Escape-SqlStringNoN $r.createdAt));"
    [void]$output.AppendLine($sql)
}
[void]$output.AppendLine("SET IDENTITY_INSERT dbo.Familias OFF;")
[void]$output.AppendLine("")

# ============================================================
# Users: id (int), username (nvarchar50), passwordHash (nvarchar255), 
#        name (nvarchar100), role (nvarchar20), isActive (bit), 
#        createdAt (datetime2(7)), updatedAt (datetime2(7)), 
#        permissions (nvarchar max)
# ============================================================
Write-Host "Parsing Users..."
$usersCols = @(
    @{Name='id'; Type='int'}
    @{Name='username'; Type='nvarchar'}
    @{Name='passwordHash'; Type='nvarchar'}
    @{Name='name'; Type='nvarchar'}
    @{Name='role'; Type='nvarchar'}
    @{Name='isActive'; Type='bit'}
    @{Name='createdAt'; Type='datetime2_fallback'}
    @{Name='updatedAt'; Type='datetime2_fallback'}
    @{Name='permissions'; Type='nvarcharmax'}
)
$usersRows = Parse-BcpFile "$BacpacDir\Data\dbo.Users\TableData-000-00000.BCP" $usersCols
[void]$output.AppendLine("-- ============================================================")
[void]$output.AppendLine("-- Users")
[void]$output.AppendLine("-- ============================================================")
[void]$output.AppendLine("SET IDENTITY_INSERT dbo.Users ON;")
foreach ($r in $usersRows) {
    $sql = "INSERT INTO dbo.Users (id, username, passwordHash, name, role, isActive, createdAt, updatedAt, permissions) VALUES ($($r.id), $(Escape-SqlString $r.username), $(Escape-SqlString $r.passwordHash), $(Escape-SqlString $r.name), $(Escape-SqlString $r.role), $([int]$r.isActive), $(Escape-SqlStringNoN $r.createdAt), $(Escape-SqlStringNoN $r.updatedAt), $(Escape-SqlString $r.permissions));"
    [void]$output.AppendLine($sql)
}
[void]$output.AppendLine("SET IDENTITY_INSERT dbo.Users OFF;")
[void]$output.AppendLine("")

# ============================================================
# Recambios (from model.xml actual columns, NO subcategoriaId):
# id (int), referenciaCMH (nvarchar50), referenciaCliente (nvarchar50),
# nombre (nvarchar200), marca (nvarchar100), unidadEmbalaje (nvarchar100),
# imagen (nvarchar500), plazoEntrega (nvarchar50), familiaId (int),
# nReposicion (int), panel (nvarchar10), col (tinyint), row (tinyint),
# stock (int), oculto (bit), createdAt (datetime2), updatedAt (datetime2),
# descripcion (nvarchar max), codigo (nvarchar50), metrica (nvarchar100)
# ============================================================
Write-Host "Parsing Recambios..."
$recambiosCols = @(
    @{Name='id'; Type='int'}
    @{Name='referenciaCMH'; Type='nvarchar'}
    @{Name='referenciaCliente'; Type='nvarchar'}
    @{Name='nombre'; Type='nvarchar'}
    @{Name='marca'; Type='nvarchar'}
    @{Name='unidadEmbalaje'; Type='nvarchar'}
    @{Name='imagen'; Type='nvarchar'}
    @{Name='plazoEntrega'; Type='nvarchar'}
    @{Name='familiaId'; Type='int'}
    @{Name='nReposicion'; Type='int'}
    @{Name='panel'; Type='nvarchar'}
    @{Name='col'; Type='tinyint'}
    @{Name='row'; Type='tinyint'}
    @{Name='stock'; Type='int'}
    @{Name='oculto'; Type='bit'}
    @{Name='createdAt'; Type='datetime2_fallback'}
    @{Name='updatedAt'; Type='datetime2_fallback'}
    @{Name='descripcion'; Type='nvarcharmax'}
    @{Name='codigo'; Type='nvarchar'}
    @{Name='metrica'; Type='nvarchar'}
)
$recambiosRows = Parse-BcpFile "$BacpacDir\Data\dbo.Recambios\TableData-000-00000.BCP" $recambiosCols
[void]$output.AppendLine("-- ============================================================")
[void]$output.AppendLine("-- Recambios")
[void]$output.AppendLine("-- ============================================================")
[void]$output.AppendLine("SET IDENTITY_INSERT dbo.Recambios ON;")
foreach ($r in $recambiosRows) {
    # Escape int values properly - handle null
    $famId = if ($null -ne $r.familiaId) { $r.familiaId } else { 'NULL' }
    $nRep = if ($null -ne $r.nReposicion) { $r.nReposicion } else { 'NULL' }
    $stockVal = if ($null -ne $r.stock) { $r.stock } else { 'NULL' }
    
    $sql = "INSERT INTO dbo.Recambios (id, referenciaCMH, referenciaCliente, nombre, marca, unidadEmbalaje, imagen, plazoEntrega, familiaId, nReposicion, panel, col, [row], stock, oculto, createdAt, updatedAt, descripcion, codigo, metrica) VALUES ($($r.id), $(Escape-SqlString $r.referenciaCMH), $(Escape-SqlString $r.referenciaCliente), $(Escape-SqlString $r.nombre), $(Escape-SqlString $r.marca), $(Escape-SqlString $r.unidadEmbalaje), $(Escape-SqlString $r.imagen), $(Escape-SqlString $r.plazoEntrega), $famId, $nRep, $(Escape-SqlString $r.panel), $($r.col), $($r.row), $stockVal, $([int]$r.oculto), $(Escape-SqlStringNoN $r.createdAt), $(Escape-SqlStringNoN $r.updatedAt), $(Escape-SqlString $r.descripcion), $(Escape-SqlString $r.codigo), $(Escape-SqlString $r.metrica));"
    [void]$output.AppendLine($sql)
}
[void]$output.AppendLine("SET IDENTITY_INSERT dbo.Recambios OFF;")
[void]$output.AppendLine("")

# Write output file
Write-Host "Writing SQL to $OutputFile..."
[System.IO.File]::WriteAllText($OutputFile, $output.ToString())
Write-Host "Done! Generated: $OutputFile"
Write-Host "  AllowedEmails: $($allowedEmailsRows.Count) rows"
Write-Host "  Familias: $($familiasRows.Count) rows"
Write-Host "  Users: $($usersRows.Count) rows"
Write-Host "  Recambios: $($recambiosRows.Count) rows"
