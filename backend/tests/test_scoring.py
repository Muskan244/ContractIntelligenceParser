from scoring import score_contract

def test_score_complete_contract():
    extracted = {
        "parties": ["A", "B"],
        "account_info": {"emails": ["a@b.com"]},
        "financial_details": {"monthly_total": "1000"},
        "payment_terms": {"terms": "Net 30"},
        "sla": {"uptime": "99.9%"}
    }

    score = score_contract(extracted)

    assert score["financial_completeness"] > 0
    assert score["party_identification"] > 0
    assert score["payment_terms_clarity"] > 0
    assert score["sla_definition"] > 0
    assert score["contact_information"] > 0
    assert score["total_score"] == sum([
        score["financial_completeness"],
        score["party_identification"],
        score["payment_terms_clarity"],
        score["sla_definition"],
        score["contact_information"],
    ])
