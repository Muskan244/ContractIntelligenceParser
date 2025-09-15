import os
import uuid
import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from db import db
from storage import save_file, get_file_path
from parser import extract_text
from extractor import extract_entities
from scoring import score_contract

app = FastAPI(title="Contract Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/contracts/upload")
async def upload_contract(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    contents = await file.read()
    max_bytes = 50 * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    stored_name = save_file(contents, file.filename)

    contract_id = str(uuid.uuid4())
    meta = {
        "contract_id": contract_id,
        "filename": stored_name,
        "original_filename": file.filename,
        "upload_ts": datetime.datetime.utcnow(),
        "state": "pending",
        "progress": 0,
        "error": None
    }
    db.contracts_meta.insert_one(meta)

    background_tasks.add_task(process_contract_background, contract_id, stored_name)

    return {"contract_id": contract_id}


def process_contract_background(contract_id: str, stored_name: str):
    try:
        db.contracts_meta.update_one({"contract_id": contract_id},
                                     {"$set": {"state": "processing", "progress": 10}})
        path = get_file_path(stored_name)
        text = extract_text(path)

        db.contracts_meta.update_one({"contract_id": contract_id},
                                     {"$set": {"progress": 50}})

        extracted = extract_entities(text)

        db.contracts_meta.update_one({"contract_id": contract_id},
                                     {"$set": {"progress": 80}})
        scored = score_contract(extracted)

        parsed_doc = {
            "contract_id": contract_id,
            "extracted": extracted,
            "scoring": scored,
            "raw_text": text,
            "processed_ts": datetime.datetime.utcnow()
        }
        db.contracts_parsed.insert_one(parsed_doc)

        db.contracts_meta.update_one({"contract_id": contract_id},
                                     {"$set": {"state": "completed", "progress": 100}})
    except Exception as e:
        db.contracts_meta.update_one({"contract_id": contract_id},
                                     {"$set": {"state": "failed", "error": str(e)}})
        raise

@app.get("/contracts/{contract_id}/status")
def get_status(contract_id: str):
    meta = db.contracts_meta.find_one({"contract_id": contract_id}, {"_id": 0})
    if not meta:
        raise HTTPException(status_code=404, detail="Contract not found")
    if isinstance(meta.get("upload_ts"), datetime.datetime):
        meta["upload_ts"] = meta["upload_ts"].isoformat()
    return meta

@app.get("/contracts/{contract_id}")
def get_contract(contract_id: str):
    meta = db.contracts_meta.find_one({"contract_id": contract_id}, {"_id": 0})
    if not meta:
        raise HTTPException(status_code=404, detail="Contract not found")
    if meta.get("state") != "completed":
        raise HTTPException(status_code=409, detail="Processing not complete")
    parsed = db.contracts_parsed.find_one({"contract_id": contract_id}, {"_id": 0})
    if not parsed:
        raise HTTPException(status_code=500, detail="Parsed result missing")
    if isinstance(parsed.get("processed_ts"), datetime.datetime):
        parsed["processed_ts"] = parsed["processed_ts"].isoformat()
    return parsed

@app.get("/contracts")
def list_contracts(status: str = None, page: int = 1, per_page: int = 20):
    q = {}
    if status:
        q["state"] = status
    skip = max(0, (page - 1)) * per_page
    cursor = db.contracts_meta.find(q, {"_id": 0}).sort("upload_ts", -1).skip(skip).limit(per_page)
    items = list(cursor)
    for it in items:
        if isinstance(it.get("upload_ts"), datetime.datetime):
            it["upload_ts"] = it["upload_ts"].isoformat()
    return {"items": items, "page": page, "per_page": per_page}

@app.get("/contracts/{contract_id}/download")
def download_contract(contract_id: str):
    meta = db.contracts_meta.find_one({"contract_id": contract_id})
    if not meta:
        raise HTTPException(status_code=404, detail="not found")
    stored = meta["filename"]
    path = get_file_path(stored)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="file not found")
    return FileResponse(path, media_type="application/pdf", filename=meta.get("original_filename", "contract.pdf"))
