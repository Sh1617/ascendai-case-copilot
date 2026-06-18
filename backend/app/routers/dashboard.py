from fastapi import APIRouter
from app.db import get_connection

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats():

    conn = get_connection()
    cur = conn.cursor()

    try:

        cur.execute(
            "SELECT COUNT(*) FROM cases"
        )
        total_cases = cur.fetchone()[0]

        cur.execute(
            "SELECT COUNT(*) FROM documents"
        )
        documents_uploaded = cur.fetchone()[0]

        cur.execute(
            """
            SELECT COUNT(*)
            FROM ai_analysis
            WHERE health_score < 70
            """
        )
        high_risk_cases = cur.fetchone()[0]

        cur.execute(
            """
            SELECT COUNT(*)
            FROM ai_analysis
            WHERE health_score = 100
            """
        )
        completed_cases = cur.fetchone()[0]

        cur.execute(
            """
            SELECT COUNT(*)
            FROM documents
            WHERE document_type='unknown'
            """
        )
        missing_documents = cur.fetchone()[0]

        active_cases = total_cases - completed_cases

        return {
            "total_cases": total_cases,
            "active_cases": active_cases,
            "documents_uploaded": documents_uploaded,
            "high_risk_cases": high_risk_cases,
            "completed_cases": completed_cases,
            "missing_documents": missing_documents
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

    finally:

        cur.close()
        conn.close()