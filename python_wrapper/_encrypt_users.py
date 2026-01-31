import json
from secure_storage import encrypt_json_and_write

with open('users.json', 'r', encoding='utf-8') as f:
    users = json.load(f)

encrypt_json_and_write('users.json.enc', users)
print('users.json.enc updated')
