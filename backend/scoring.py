from typing import Dict

WEIGHTS = {
    "financial_completeness": 30,
    "party_identification": 25,
    "payment_terms_clarity": 20,
    "sla_definition": 15,
    "contact_information": 10,
}

def score_contract(extracted: Dict) -> Dict:
    scores = {}
    total = 0
    gaps = []

    financials = extracted.get("financial_details", {})
    fin_ok = bool(financials.get("monthly_total") and financials.get("annual_value"))
    scores["financial_completeness"] = WEIGHTS["financial_completeness"] if fin_ok else 0
    if not fin_ok:
        gaps.append("Missing financial totals (monthly/annual)")

    parties = extracted.get("parties", [])
    party_ok = len(parties) >= 2
    scores["party_identification"] = WEIGHTS["party_identification"] if party_ok else 0
    if not party_ok:
        gaps.append("Missing party details (Service Provider/Customer)")

    payment_terms = extracted.get("payment_terms", {})
    pay_ok = bool(payment_terms.get("terms"))
    scores["payment_terms_clarity"] = WEIGHTS["payment_terms_clarity"] if pay_ok else 0
    if not pay_ok:
        gaps.append("Payment terms missing or unclear")

    sla = extracted.get("sla", {})
    sla_ok = bool(sla.get("uptime") and sla.get("response_time_defined"))
    scores["sla_definition"] = WEIGHTS["sla_definition"] if sla_ok else 0
    if not sla_ok:
        gaps.append("Missing SLA (uptime/response times)")

    contact_info = extracted.get("account_info", {})
    contact_ok = bool(contact_info.get("emails") and contact_info.get("phones"))
    scores["contact_information"] = WEIGHTS["contact_information"] if contact_ok else 0
    if not contact_ok:
        gaps.append("No valid contact email/phone found")

    total = sum(scores.values())
    scores["total_score"] = total
    scores["gaps"] = gaps

    return scores
