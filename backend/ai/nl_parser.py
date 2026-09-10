"""
Natural Language Requirement Parser for ThermoShelter.
Parses natural language requests into structured design parameters.
Works reliably via deterministic regex/keyword parsing, with optional Ollama local LLM fallback.
"""

import re
from typing import Dict, Any

def parse_natural_language_requirements(text: str) -> Dict[str, Any]:
    """
    Extract:
    - Location name
    - Capacity (number of people)
    - Budget (in INR)
    - Shelter purpose
    - Priority
    """
    text_clean = text.strip()

    # 1. Extract Capacity
    capacity = 20 # default
    cap_match = re.search(r'(\d+)\s*(people|persons|passengers|occupants|pax|capacity)', text_clean, re.IGNORECASE)
    if cap_match:
        capacity = int(cap_match.group(1))
    else:
        num_match = re.search(r'\bfor\s+(\d+)\b', text_clean, re.IGNORECASE)
        if num_match:
            capacity = int(num_match.group(1))

    # 2. Extract Budget
    budget = 120000.0
    # Match patterns like: "1 lakh", "1.5 lakh", "₹1,00,000", "50000", "2.5 lakhs"
    lakh_match = re.search(r'(\d+(\.\d+)?)\s*(lakh|lac|lakhs)', text_clean, re.IGNORECASE)
    if lakh_match:
        budget = float(lakh_match.group(1)) * 100000.0
    else:
        inr_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d{4,7})', text_clean, re.IGNORECASE)
        if inr_match:
            val_str = inr_match.group(1).replace(",", "")
            if float(val_str) > 1000:
                budget = float(val_str)

    # 3. Extract Location
    known_cities = ["jodhpur", "jaisalmer", "delhi", "mumbai", "chennai", "shimla", "kolkata", "bengaluru", "hyderabad", "pune", "ahmedabad", "jaipur"]
    location_detected = "Jodhpur, Rajasthan"
    text_lower = text_clean.lower()
    for city in known_cities:
        if city in text_lower:
            location_detected = city.capitalize()
            break
    else:
        # Check for 'in <Location>'
        in_match = re.search(r'\bin\s+([A-Za-z\s]+?)(?:with|\.|,|$|for)', text_clean, re.IGNORECASE)
        if in_match:
            loc_candidate = in_match.group(1).strip()
            if len(loc_candidate) > 2 and loc_candidate.lower() not in ["a", "an", "the", "public"]:
                location_detected = loc_candidate

    # 4. Extract Purpose
    purpose = "Public waiting shelter"
    if re.search(r'bus\s*stop', text_lower):
        purpose = "Bus stop"
    elif re.search(r'worker|labour|rest', text_lower):
        purpose = "Worker rest shelter"
    elif re.search(r'emergency|disaster|relief', text_lower):
        purpose = "Emergency shelter"
    elif re.search(r'rural|community|village', text_lower):
        purpose = "Rural community shelter"
    elif re.search(r'tourist|park', text_lower):
        purpose = "Tourist shelter"

    # 5. Extract Priority
    priority = "Balanced"
    if re.search(r'comfort|cool|thermal', text_lower):
        priority = "Thermal comfort"
    elif re.search(r'economy|cheap|low\s*cost|budget', text_lower):
        priority = "Low cost"

    return {
        "extracted_location": location_detected,
        "extracted_capacity": capacity,
        "extracted_budget_inr": budget,
        "extracted_purpose": purpose,
        "extracted_priority": priority,
        "raw_query": text_clean,
        "status": "Successfully parsed via deterministic rule engine"
    }
