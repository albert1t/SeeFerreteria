"""Convert bacpac BCP to SQL INSERT statements."""
import struct, os
from datetime import datetime, timedelta

BACDIR = os.environ.get('TEMP', '') + '\\bacpac_extracted\\Data'
OUTPUT = os.path.dirname(__file__) + '\\bacpac_data.sql'

TABLES = {
    'AllowedEmails': [
        ('id','int'), ('email','nvarchar'), ('role','nvarchar'),
        ('permissions','nvarcharmax'), ('isActive','bit'), ('createdAt','datetime2'),
    ],
    'Familias': [
        ('id','int'), ('nombre','nvarchar'), ('descripcion','nvarchar'),
        ('createdAt','datetime2'),
    ],
    'Users': [
        ('id','int'), ('username','nvarchar'), ('passwordHash','nvarchar'),
        ('name','nvarchar'), ('role','nvarchar'), ('isActive','bit'),
        ('createdAt','datetime2'), ('updatedAt','datetime2'), ('permissions','nvarcharmax'),
    ],
    'Recambios': [
        ('id','int'),
        ('referenciaCMH','nvarchar'), ('referenciaCliente','nvarchar'),
        ('nombre','nvarchar'), ('marca','nvarchar'), ('unidadEmbalaje','nvarchar'),
        ('imagen','nvarchar'), ('plazoEntrega','nvarchar'),
        ('familiaId','int'), ('nReposicion','int_nullable'),
        ('panel','nvarchar'), ('col','tinyint'), ('row','tinyint'),
        ('stock','int_nullable'), ('oculto','bit'),
        ('createdAt','datetime2'), ('updatedAt','datetime2'),
        ('descripcion','nvarcharmax'), ('codigo','nvarchar'), ('metrica','nvarchar'),
    ],
}

def read_col(data, pos, typ):
    start = pos
    try:
        if typ == 'int':
            v = struct.unpack_from('<i', data, pos)[0]
            return v, pos + 4
        elif typ == 'int_nullable':
            # 1-byte null indicator: 0=value, 1=null
            if data[pos] != 0:
                return None, pos + 1
            v = struct.unpack_from('<i', data, pos+1)[0]
            return v, pos + 5
        elif typ == 'tinyint':
            return data[pos], pos + 1
        elif typ == 'bit':
            return bool(data[pos]), pos + 1
        elif typ == 'nvarchar':
            strlen = struct.unpack_from('<H', data, pos)[0]
            if strlen == 0xFFFF:
                return None, pos + 2
            if strlen == 0:
                return '', pos + 2
            return data[pos+2:pos+2+strlen].decode('utf-16-le'), pos + 2 + strlen
        elif typ == 'nvarcharmax':
            strlen = struct.unpack_from('<i', data, pos)[0]
            if strlen == -1:
                return None, pos + 4
            if strlen == 0:
                return '', pos + 4
            return data[pos+4:pos+4+strlen].decode('utf-16-le'), pos + 4 + strlen
        elif typ == 'datetime2':
            return _read_datetime2(data, pos)
    except:
        pass
    return None, pos

def _read_datetime2(data, pos):
    scale = data[pos]; pos += 1
    tlen = 3 if scale <= 2 else (4 if scale <= 4 else 5)
    days = struct.unpack_from('<I', data[pos:pos+3] + b'\x00')[0]
    pos += 3
    if tlen == 3:
        ticks = struct.unpack_from('<I', data[pos:pos+3] + b'\x00')[0]
    elif tlen == 4:
        ticks = struct.unpack_from('<I', data[pos:pos+4])[0]
    else:
        ticks = struct.unpack_from('<Q', data[pos:pos+5] + b'\x00\x00\x00')[0]
    pos += tlen
    try:
        dt = datetime(1,1,1) + timedelta(days=days, microseconds=ticks//10)
        if scale >= 5:
            return dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:23], pos
        return dt.strftime('%Y-%m-%d %H:%M:%S'), pos
    except:
        return '2024-01-01 00:00:00', pos

def parse(name, data):
    cols = TABLES[name]
    rows, pos = [], 0
    max_iter = 10000
    while pos < len(data) and len(rows) < max_iter:
        row, orig = {}, pos
        for cname, ctype in cols:
            v, pos = read_col(data, pos, ctype)
            row[cname] = v
        if pos == orig and len(rows) > 0:
            break
        if pos > orig:
            rows.append(row)
        else:
            break
    return rows

def esc(v):
    if v is None: return 'NULL'
    if isinstance(v, bool): return '1' if v else '0'
    if isinstance(v, int): return str(v)
    if isinstance(v, str):
        s = v.replace("'", "''")
        # Check if string has non-ASCII characters
        if any(ord(c) > 127 for c in v):
            return f"N'{s}'"
        return f"N'{s}'"
    return f"N'{v}'"

def main():
    lines = []
    for tname, cols in TABLES.items():
        bcp = os.path.join(BACDIR, f'dbo.{tname}', 'TableData-000-00000.BCP')
        if not os.path.exists(bcp):
            print(f"  {tname}: BCP not found")
            continue
        print(f"Parsing {tname}...", end=' ', flush=True)
        with open(bcp, 'rb') as f:
            data = f.read()
        rows = parse(tname, data)
        print(f"{len(rows)} rows")
        if not rows:
            continue
        clist = ", ".join(c[0] for c in cols)
        lines.append(f"SET IDENTITY_INSERT dbo.{tname} ON;")
        for r in rows:
            vals = ", ".join(esc(r[c[0]]) for c in cols)
            lines.append(f"INSERT INTO dbo.{tname} ({clist}) VALUES ({vals});")
        lines.append(f"SET IDENTITY_INSERT dbo.{tname} OFF;\n")
    
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.write("-- SEE Ferreteria - bacpac data export\n\n")
        f.write('\n'.join(lines))
        f.write('\n')
    print(f"\nWritten to: {OUTPUT}")

if __name__ == '__main__':
    main()
