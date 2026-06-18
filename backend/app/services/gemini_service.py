import os
import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


def analyze_document(text: str):

    prompt = f"""
You are an immigration case analyst.

Extract:

1. Full Name
2. Education
3. Experience
4. Passport Number
5. Nationality

Return JSON only.

Document:

{text}
"""

    response = model.generate_content(prompt)

    return response.text