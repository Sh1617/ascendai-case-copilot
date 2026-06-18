from fastapi import APIRouter, UploadFile, File, Form
from app.db import get_connection

import os
import shutil

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


def detect_document_type(filename: str):

    filename = filename.lower()

    if "resume" in filename:
        return "resume"

    elif "passport" in filename:
        return "passport"

    elif "degree" in filename:
        return "degree_certificate"

    elif "experience" in filename:
        return "experience_letter"

    elif "cv" in filename:
        return "resume"

    return "unknown"


@router.post("/upload")
async def upload_document(
    case_id: int = Form(...),
    file: UploadFile = File(...)
):

    conn = get_connection()
    cur = conn.cursor()

    try:

        file_path = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        # Save file
        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        # Detect document type automatically
        document_type = detect_document_type(
            file.filename
        )

        # Insert into database
        cur.execute(
            """
            INSERT INTO documents
            (
                case_id,
                document_type,
                file_path
            )
            VALUES (%s,%s,%s)
            RETURNING id
            """,
            (
                case_id,
                document_type,
                file_path
            )
        )

        document_id = cur.fetchone()[0]

        conn.commit()

        return {
            "success": True,
            "document_id": document_id,
            "case_id": case_id,
            "document_type": document_type,
            "file_name": file.filename,
            "file_path": file_path
        }

    except Exception as e:

        conn.rollback()

        return {
            "success": False,
            "error": str(e)
        }

    finally:

        cur.close()
        conn.close()