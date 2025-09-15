import re
from typing import Dict, Any

def extract_entities(text: str) -> Dict[str, Any]:
    result = {
        "parties": [],
        "account_info": {},
        "financial_details": {},
        "payment_terms": {},
        "sla": {},
        "representatives": []
    }

    provider_match = re.search(r"Service Provider:\s*(.+)", text)
    customer_match = re.search(r"Customer:\s*(.+)", text)
    if provider_match:
        result["parties"].append(provider_match.group(1).strip())
    if customer_match:
        result["parties"].append(customer_match.group(1).strip())

    reps = re.findall(r"Authorized Representatives:\s*[\s\S]{0,200}", text)
    if reps:
        result["representatives"].append(reps[0].strip())
    emails = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}", text)
    if emails:
        result["account_info"]["emails"] = list(set(emails))  # unique

    phones = re.findall(r"\(\d{3}\)\s?\d{3}-\d{4}", text)
    if phones:
        result["account_info"]["phones"] = phones
    bank_match = re.search(r"Bank:\s*(.+)", text)
    account_match = re.search(r"Account:\s*([\d\-]+)", text)
    routing_match = re.search(r"Routing:\s*(\d+)", text)
    if bank_match:
        result["account_info"]["bank"] = bank_match.group(1).strip()
    if account_match:
        result["account_info"]["account"] = account_match.group(1).strip()
    if routing_match:
        result["account_info"]["routing"] = routing_match.group(1).strip()

    monthly_total = re.search(r"Total Monthly Amount:\s*\$([\d,]+\.\d{2})", text)
    one_time_total = re.search(r"Total One-Time Amount:\s*\$([\d,]+\.\d{2})", text)
    annual_value = re.search(r"Annual Contract Value:\s*\$([\d,]+\.\d{2})", text)
    if monthly_total:
        result["financial_details"]["monthly_total"] = monthly_total.group(1)
    if one_time_total:
        result["financial_details"]["one_time_total"] = one_time_total.group(1)
    if annual_value:
        result["financial_details"]["annual_value"] = annual_value.group(1)

    net_terms = re.search(r"Net\s*(\d+)", text, re.IGNORECASE)
    if net_terms:
        result["payment_terms"]["terms"] = f"Net {net_terms.group(1)}"
    if "monthly recurring billing" in text.lower():
        result["payment_terms"]["schedule"] = "Monthly recurring billing"

    if "99.9%" in text or "uptime" in text.lower():
        result["sla"]["uptime"] = "99.9%"
    if "response time" in text.lower():
        result["sla"]["response_time_defined"] = True
    if "service credits" in text.lower():
        result["sla"]["penalties"] = "Service credits available"

    return result
