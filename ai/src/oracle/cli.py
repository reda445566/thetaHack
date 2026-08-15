"""Simple CLI for sending decision requests to the ORACLE API."""

import json
import sys

try:
    import httpx
except ImportError:
    import urllib.request as request
    import urllib.error as error


import re

API_URL = "http://127.0.0.1:8000/decide"
REQUEST_TIMEOUT = 300.0


def is_arabic(text: str) -> bool:
    return bool(re.search(r'[\u0600-\u06FF]', text))


def post_decision(problem: str, user_input: str, language: str = "") -> dict:
    if not language and (is_arabic(problem) or is_arabic(user_input)):
        language = "Arabic"

    payload = {
        "problem_description": problem,
        "user_input": user_input,
    }
    if language:
        payload["language"] = language

    headers = {"Content-Type": "application/json"}

    try:
        if "httpx" in sys.modules:
            response = httpx.post(API_URL, json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            return response.json()
        else:
            data = json.dumps(payload).encode("utf-8")
            req = request.Request(API_URL, data=data, headers=headers, method="POST")
            with request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        return {"error": str(exc)}


def main() -> None:
    print("=" * 50)
    print("🧠 ORACLE AI Deliberation Engine CLI")
    print("أدخل المشكلة أو القرار للبدء. اضغط Ctrl+C للخروج.")
    print("=" * 50)

    try:
        while True:
            problem = input("\n[المشكلة / Problem]: ").strip()
            if not problem:
                print("يرجى إدخال وصف المشكلة.")
                continue

            user_input = input("[سياق إضافي / Context (اختياري)]: ").strip()
            print("\n⏳ جاري التفكير وتحليل القرار من كافة الوكلاء (Climate, Economy, Health, Citizen, Ethics, Judge)... قد يستغرق ذلك 15-30 ثانية...")

            result = post_decision(problem, user_input)

            if "error" in result or "detail" in result:
                print("\n❌ حدث خطأ:")
                print(result.get("detail") or result.get("error"))
                continue

            print("\n" + "=" * 50)
            print("🎯 [القرار النهائي / Final Decision]:")
            print(result.get("final_decision", "لا يوجد قرار"))
            print(f"\n📊 [نسبة الثقة / Confidence]: {int(result.get('final_confidence', 0) * 100)}%")
            print("\n📝 [سبب القرار والتحليل المجمل]:")
            print(result.get("decision_reasoning", ""))

            print("\n" + "-" * 50)
            print("📋 [تفاصيل تحليلات الوكلاء المتخصصين]:")
            print(f"🌍 المناخ (Climate): {result.get('climate_analysis')}")
            print(f"💰 الاقتصاد (Economy): {result.get('economy_analysis')}")
            print(f"❤️ الصحة (Health): {result.get('health_analysis')}")
            print(f"👥 المواطن (Citizen): {result.get('citizen_perspective')}")
            print(f"⚖️ الأخلاقيات (Ethics): {result.get('ethics_evaluation')}")
            print("=" * 50)
    except KeyboardInterrupt:
        print("\n\nإلى اللقاء 👋")


if __name__ == "__main__":
    main()
