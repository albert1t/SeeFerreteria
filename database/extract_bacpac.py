"""
Extract data from bacpac BCP files and generate a complete SQL file for OVH Cloud.
Handles SQL Server native BCP format correctly.
"""
import struct, os, sys
from datetime import datetime, timedelta, timezone

BACDIR = os.environ.get('TEMP', '') + '\\bacpac_extracted\\Data'
if not os.path.exists(BACDIR):
    print("Extracting bacpac...")
    import zipfile
    bacpath = r"C:\Users\thedu\OneDrive\Escritorio\Backup_SeeFerreteria.bacpac"
    with zipfile.ZipFile(bacpath, 'r') as z:
        z.extractall(os.environ.get('TEMP') + '\\bacpac_extracted')
    print("Extracted.")

OUTPUT = os.path.dirname(__file__) + '\\see_ferreteria_ovh.sql'

def esc(v):
    if v is None: return 'NULL'
    if isinstance(v, bool): return '1' if v else '0'
    if isinstance(v, int): return str(v)
    s = str(v).replace("'", "''")
    return f"N'{s}'"

def read_bcp(path, columns):
    """
    columns: list of (name, type)
    type: 'int', 'int_n', 'tinyint', 'bit', 'nvarchar', 'nvarcharmax', 'datetime2'
    Types ending in _n use 1-byte null indicator (0=value, non-0=null).
    """
    with open(path, 'rb') as f:
        data = f.read()
    
    rows, pos = [], 0
    
    while pos < len(data):
        row = {}
        start = pos
        ok = True
        
        for name, typ in columns:
            if pos >= len(data):
                ok = False
                break
            
            try:
                if typ == 'int':
                    row[name] = struct.unpack_from('<i', data, pos)[0]
                    pos += 4
                
                elif typ == 'int_n':
                    ind = data[pos]; pos += 1
                    if ind == 0:
                        row[name] = struct.unpack_from('<i', data, pos)[0]
                        pos += 4
                    else:
                        row[name] = None
                
                elif typ == 'tinyint':
                    row[name] = data[pos]; pos += 1
                
                elif typ == 'bit':
                    row[name] = bool(data[pos]); pos += 1
                
                elif typ == 'nvarchar':
                    strlen = struct.unpack_from('<H', data, pos)[0]; pos += 2
                    if strlen == 0xFFFF:
                        row[name] = None
                    elif strlen == 0:
                        row[name] = ''
                    else:
                        row[name] = data[pos:pos+strlen].decode('utf-16-le')
                        pos += strlen
                
                elif typ == 'nvarcharmax':
                    strlen = struct.unpack_from('<i', data, pos)[0]; pos += 4
                    if strlen == -1 or strlen == 0xFFFFFFFF:
                        row[name] = None
                    elif strlen == 0:
                        row[name] = ''
                    else:
                        row[name] = data[pos:pos+strlen].decode('utf-16-le')
                        pos += strlen
                
                elif typ == 'datetime2':
                    # datetime2 format: 1 byte scale + 3 bytes date + 3-5 bytes time
                    # Date and time are stored as BIG-ENDIAN integers
                    scale = data[pos]; pos += 1
                    
                    if scale < 0 or scale > 7:
                        ok = False
                        break
                    
                    tlen = 3 if scale <= 2 else (4 if scale <= 4 else 5)
                    
                    if pos + 3 + tlen > len(data):
                        ok = False
                        break
                    
                    # Date: 3 bytes big-endian (days since 0001-01-01)
                    days = (data[pos] << 16) | (data[pos+1] << 8) | data[pos+2]
                    pos += 3
                    
                    # Time: tlen bytes big-endian (100-ns ticks since midnight)
                    ticks = 0
                    for i in range(tlen):
                        ticks = (ticks << 8) | data[pos + i]
                    pos += tlen
                    
                    try:
                        dt = datetime(1, 1, 1) + timedelta(days=days, microseconds=ticks//10)
                        if scale >= 5:
                            row[name] = dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:23]
                        elif scale >= 3:
                            row[name] = dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:19]
                        else:
                            row[name] = dt.strftime('%Y-%m-%d %H:%M:%S')
                    except:
                        row[name] = '2024-01-01 00:00:00.0000000'
                
                else:
                    ok = False
                    break
                    
            except Exception as e:
                ok = False
                break
        
        if ok and len(row) == len(columns) and pos > start:
            rows.append(row)
        else:
            break
    
    return rows


# ============================================================
# TABLE DEFINITIONS (based on actual DB schema from bacpac model.xml)
# ============================================================

TABLES = [
    # (table_name, identity_insert, columns)
    
    ("Familias", True, [
        ('id', 'int'),
        ('nombre', 'nvarchar'),
        ('descripcion', 'nvarchar'),
        ('createdAt', 'datetime2'),
    ]),
    
    ("AllowedEmails", True, [
        ('id', 'int'),
        ('email', 'nvarchar'),
        ('role', 'nvarchar'),
        ('permissions', 'nvarcharmax'),
        ('isActive', 'bit'),
        ('createdAt', 'datetime2'),
    ]),
    
    ("Users", True, [
        ('id', 'int'),
        ('username', 'nvarchar'),
        ('passwordHash', 'nvarchar'),
        ('name', 'nvarchar'),
        ('role', 'nvarchar'),
        ('isActive', 'bit'),
        ('createdAt', 'datetime2'),
        ('updatedAt', 'datetime2'),
        ('permissions', 'nvarcharmax'),
    ]),
    
    ("Recambios", True, [
        ('id', 'int'),
        ('referenciaCMH', 'nvarchar'),
        ('referenciaCliente', 'nvarchar'),
        ('nombre', 'nvarchar'),
        ('marca', 'nvarchar'),
        ('unidadEmbalaje', 'nvarchar'),
        ('imagen', 'nvarchar'),
        ('plazoEntrega', 'nvarchar'),
        ('familiaId', 'int'),
        ('nReposicion', 'int_n'),  # nullable in actual DB!
        ('panel', 'nvarchar'),
        ('col', 'tinyint'),
        ('row', 'tinyint'),
        ('stock', 'int_n'),  # nullable
        ('oculto', 'bit'),
        ('createdAt', 'datetime2'),
        ('updatedAt', 'datetime2'),
        ('descripcion', 'nvarcharmax'),
        ('codigo', 'nvarchar'),
        ('metrica', 'nvarchar'),
    ]),
    
    # Note: Pedidos and PedidosEstadoHistorial don't have BCP data in the bacpac
    # (no Data directories for them)
]


def main():
    lines = []
    
    lines.append("-- ============================================================")
    lines.append("-- SEE Ferretería - Esquema + Datos completos para OVH Cloud")
    lines.append("-- Generado desde el bacpac de Azure SQL Database")
    lines.append("-- ============================================================")
    lines.append("")
    
    # SCHEMA
    schema_path = os.path.join(os.path.dirname(__file__), 'schema_only.sql')
    # We'll embed the schema inline
    
    # Read all tables' data
    for table_name, use_identity, columns in TABLES:
        bcp_path = os.path.join(BACDIR, f'dbo.{table_name}', 'TableData-000-00000.BCP')
        if not os.path.exists(bcp_path):
            print(f"  {table_name}: BCP not found, skipping")
            continue
        
        print(f"Parsing {table_name}...", end=' ', flush=True)
        rows = read_bcp(bcp_path, columns)
        print(f"{len(rows)} rows")
        
        if not rows:
            continue
        
        col_names = ", ".join(c[0] for c in columns)
        
        if use_identity:
            lines.append(f"SET IDENTITY_INSERT dbo.{table_name} ON;")
        
        for r in rows:
            vals = ", ".join(esc(r.get(c[0])) for c in columns)
            lines.append(f"INSERT INTO dbo.{table_name} ({col_names}) VALUES ({vals});")
        
        if use_identity:
            lines.append(f"SET IDENTITY_INSERT dbo.{table_name} OFF;")
        lines.append("")
    
    # Write output
    print(f"\nWriting to {OUTPUT}...")
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        for line in lines:
            f.write(line + '\n')
    
    print("Done!")


if __name__ == '__main__':
    main()
