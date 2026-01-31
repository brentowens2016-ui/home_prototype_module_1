"""
secure_storage.py: Transparent encryption/decryption for sensitive project files

- Uses AES-256-GCM for strong encryption
- Key is loaded from SECURE_STORAGE_KEY env var (must be 32 bytes, base64)
- All read/write of sensitive files should go through this module
"""
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def get_key():
    key_b64 = os.environ.get("SECURE_STORAGE_KEY")
    if not key_b64:
        raise RuntimeError("SECURE_STORAGE_KEY env var not set")
    key = base64.urlsafe_b64decode(key_b64)
    if len(key) != 32:
        raise ValueError("SECURE_STORAGE_KEY must decode to 32 bytes (256 bits)")
    return key

def encrypt_and_write(path, data: bytes):
    key = get_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ct = aesgcm.encrypt(nonce, data, None)
    with open(path, "wb") as f:
        f.write(nonce + ct)

def read_and_decrypt(path) -> bytes:
    key = get_key()
    with open(path, "rb") as f:
        raw = f.read()
    nonce, ct = raw[:12], raw[12:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ct, None)

def encrypt_json_and_write(path, obj):
    import json
    data = json.dumps(obj, indent=2).encode("utf-8")
    encrypt_and_write(path, data)

def read_and_decrypt_json(path):
    import json
    data = read_and_decrypt(path)
    return json.loads(data.decode("utf-8"))
