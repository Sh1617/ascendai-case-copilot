REQUIRED_DOCS = {
    "H1B": [
        "passport",
        "resume",
        "degree_certificate",
        "experience_letter"
    ]
}


def check_missing_documents(
    case_type: str,
    uploaded_docs: list
):
    required = REQUIRED_DOCS.get(
        case_type,
        []
    )

    return list(
        set(required) - set(uploaded_docs)
    )