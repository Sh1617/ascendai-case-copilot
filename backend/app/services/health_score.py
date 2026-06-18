def calculate_health_score(
    missing_docs_count: int
):
    score = 100

    score -= missing_docs_count * 15

    return max(
        score,
        0
    )