from fastapi import APIRouter

from app.db import get_connection

from app.services.pdf_extractor import extract_text_from_pdf
from app.services.gemini_service import analyze_document
from app.services.completeness_checker import check_missing_documents
from app.services.health_score import calculate_health_score
from app.services.recommendations import generate_recommendations


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.post("/analyze/{case_id}")
def analyze_case(case_id: int):

    conn = get_connection()
    cur = conn.cursor()

    try:

        # Get uploaded documents
        cur.execute(
            """
            SELECT document_type, file_path
            FROM documents
            WHERE case_id = %s
            """,
            (case_id,)
        )

        documents = cur.fetchall()

        if not documents:
            return {
                "success": False,
                "message": "No documents found for this case"
            }

        uploaded_docs = []
        combined_text = ""

        # Extract text from PDFs
        for doc_type, file_path in documents:

            uploaded_docs.append(doc_type)

            try:

                text = extract_text_from_pdf(
                    file_path
                )

                if text:
                    combined_text += text + "\n"

            except Exception as e:

                print(
                    f"Error processing {file_path}: {e}"
                )

        # Get Case Type
        cur.execute(
            """
            SELECT case_type
            FROM cases
            WHERE id = %s
            """,
            (case_id,)
        )

        case_row = cur.fetchone()

        if not case_row:
            return {
                "success": False,
                "message": "Case not found"
            }

        case_type = case_row[0]

        # Missing Documents
        missing_documents = check_missing_documents(
            case_type,
            uploaded_docs
        )

        # Health Score
        health_score = calculate_health_score(
            len(missing_documents)
        )

        # Risk + Recommendations
        recommendation_data = generate_recommendations(
            health_score,
            missing_documents
        )

        # Gemini Analysis
        ai_summary = analyze_document(
            combined_text
        )

        # Save Analysis
        cur.execute(
            """
            INSERT INTO ai_analysis
            (
                case_id,
                summary,
                missing_documents,
                health_score
            )
            VALUES (%s,%s,%s,%s)
            RETURNING id
            """,
            (
                case_id,
                str(ai_summary),
                ",".join(missing_documents),
                health_score
            )
        )

        analysis_id = cur.fetchone()[0]

        conn.commit()

        return {
            "success": True,
            "analysis_id": analysis_id,
            "case_id": case_id,
            "health_score": health_score,
            "risk_level": recommendation_data["risk_level"],
            "recommendations": recommendation_data["recommendations"],
            "missing_documents": missing_documents,
            "analysis": ai_summary
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


@router.get("/result/{case_id}")
def get_analysis(case_id: int):

    conn = get_connection()
    cur = conn.cursor()

    try:

        cur.execute(
            """
            SELECT
                id,
                summary,
                missing_documents,
                health_score,
                created_at
            FROM ai_analysis
            WHERE case_id = %s
            ORDER BY id DESC
            LIMIT 1
            """,
            (case_id,)
        )

        result = cur.fetchone()

        if not result:

            return {
                "success": False,
                "message": "Analysis not found"
            }

        missing_docs = []

        if result[2]:
            missing_docs = result[2].split(",")

        recommendation_data = generate_recommendations(
            result[3],
            missing_docs
        )

        return {
            "success": True,
            "analysis_id": result[0],
            "summary": result[1],
            "missing_documents": missing_docs,
            "health_score": result[3],
            "risk_level": recommendation_data["risk_level"],
            "recommendations": recommendation_data["recommendations"],
            "created_at": result[4]
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

    finally:

        cur.close()
        conn.close()