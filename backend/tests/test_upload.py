import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_upload_valid_pdf(tmp_path):
    pdf_file = tmp_path / "test.pdf"
    pdf_file.write_bytes(b"%PDF-1.4 fake content")

    with open(pdf_file, "rb") as f:
        response = client.post("/contracts/upload", files={"file": ("test.pdf", f, "application/pdf")})

    assert response.status_code == 200
    data = response.json()
    assert "contract_id" in data

def test_upload_invalid_file(tmp_path):
    txt_file = tmp_path / "test.txt"
    txt_file.write_text("Not a PDF")

    with open(txt_file, "rb") as f:
        response = client.post("/contracts/upload", files={"file": ("test.txt", f, "text/plain")})

    assert response.status_code in [400, 422]
