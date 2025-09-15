import os
import uuid

STORAGE_PATH = os.getenv("STORAGE_PATH", "uploads")
os.makedirs(STORAGE_PATH, exist_ok=True)

def save_file(file_bytes: bytes, filename: str) -> str:
    uid = str(uuid.uuid4())
    safe_name = f"{uid}_{filename.replace(' ', '_')}"
    path = os.path.join(STORAGE_PATH, safe_name)
    with open(path, "wb") as f:
        f.write(file_bytes)
    return safe_name

def get_file_path(stored_name: str) -> str:
    return os.path.join(STORAGE_PATH, stored_name)
