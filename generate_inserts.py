import re
import json
import time

with open("C:/Users/User/OneDrive/Ai/app.js", "r", encoding="utf-8") as f:
    content = f.read()

# Extract SEED_TRANSACTIONS = [ ... ]
pattern = r"const SEED_TRANSACTIONS = \[(.*?)\];"
match = re.search(pattern, content, re.DOTALL)
if not match:
    print("Could not find SEED_TRANSACTIONS")
    exit(1)

# Format the matching text to valid JSON
list_content = match.group(1).strip()

# Let's clean the javascript array to be valid JSON
# We can parse the individual object literals using regex or simple parser
# Let's find all { ... } blocks
blocks = re.findall(r"\{(.*?)\}", list_content, re.DOTALL)

def parse_custom_date(date_str):
    date_str = date_str.strip()
    if re.match(r"^\d{4}-\d{2}-\d{2}$", date_str):
        return date_str
    
    parts = re.split(r"[-/]", date_str)
    if len(parts) != 3:
        return date_str
    
    p1 = int(parts[0])
    p2 = int(parts[1])
    yr = int(parts[2])
    if yr < 100:
        yr += 2000
    
    if p1 > 12:
        day = p1
        month = p2
    elif p2 > 12:
        day = p2
        month = p1
    else:
        if p2 == 5:
            month = 5
            day = p1
        elif p1 == 5:
            month = 5
            day = p2
        elif p1 == 6:
            month = 6
            day = p2
        elif p2 == 6:
            month = 6
            day = p1
        else:
            day = p1
            month = p2
            
    return f"{yr:04d}-{month:02d}-{day:02d}"

sql_lines = []
for b in blocks:
    # parse key-value pairs
    pairs = re.findall(r"(\w+):\s*(['\"].*?['\"]|[\d.]+)", b)
    t_data = {}
    for k, v in pairs:
        # Strip quotes if string
        val = v.strip()
        if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
            val = val[1:-1]
        else:
            try:
                val = float(val) if '.' in val else int(val)
            except ValueError:
                pass
        t_data[k] = val
        
    # Ensure optional fields exist
    txn_id = t_data.get("id", "")
    date_str = parse_custom_date(t_data.get("date", ""))
    txn_type = t_data.get("type", "")
    platform = t_data.get("platform", "")
    total = float(t_data.get("total", 0))
    category = t_data.get("category", "")
    location = t_data.get("location", "")
    remark = t_data.get("remark", "")
    updated_at = int(time.time() * 1000)
    
    # Escape quotes
    txn_id = txn_id.replace("'", "''")
    platform = platform.replace("'", "''")
    category = category.replace("'", "''")
    location = location.replace("'", "''")
    remark = remark.replace("'", "''")
    
    sql_lines.append(
        f"INSERT OR IGNORE INTO transactions (id, date, type, platform, total, category, location, remark, updated_at) "
        f"VALUES ('{txn_id}', '{date_str}', '{txn_type}', '{platform}', {total}, '{category}', '{location}', '{remark}', {updated_at});"
    )

with open("C:/Users/User/OneDrive/Ai/seed_data.sql", "w", encoding="utf-8") as out:
    out.write("\n".join(sql_lines))

print(f"Successfully generated seed_data.sql with {len(sql_lines)} queries.")
