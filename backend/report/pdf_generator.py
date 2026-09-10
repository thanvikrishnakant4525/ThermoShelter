"""
PDF Technical Report Generator for ThermoShelter.
Produces professional, publication-ready engineering specification sheets using ReportLab.
"""

import io
from datetime import datetime
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(
    project_data: Dict[str, Any]
) -> bytes:
    """
    Generate PDF report byte stream from shelter project data.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a')
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#475569')
    )
    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    badge_style = ParagraphStyle(
        'BadgeCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0369a1')
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#64748b')
    )

    story = []

    # Title Block
    story.append(Paragraph("ThermoShelter — Area-Specific Thermal Comfort Shelter Report", title_style))
    story.append(Paragraph(f"Autonomous Decision-Support Model | Generated {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceBefore=2, spaceAfter=10))

    # Location & Climate Section
    loc = project_data.get("location", {})
    env = project_data.get("environmental_data", {})
    clim = project_data.get("climate_character", {})
    opt = project_data.get("selected_option", {})
    base = project_data.get("baseline_shelter", {})

    story.append(Paragraph("1. Site & Environmental Assessment", h2_style))

    site_table_data = [
        [
            Paragraph("<b>Target Location:</b>", body_style),
            Paragraph(f"{loc.get('name', 'N/A')}", body_style),
            Paragraph("<b>Coordinates:</b>", body_style),
            Paragraph(f"{loc.get('latitude', 0.0)}°N, {loc.get('longitude', 0.0)}°E", body_style)
        ],
        [
            Paragraph("<b>Climate Classification:</b>", body_style),
            Paragraph(f"<b>{clim.get('category', 'N/A')}</b>", badge_style),
            Paragraph("<b>Elevation:</b>", body_style),
            Paragraph(f"{loc.get('elevation_m', 0)} m AMSL", body_style)
        ],
        [
            Paragraph("<b>Ambient Temperature:</b>", body_style),
            Paragraph(f"{env.get('temperature_c', 0.0)}°C", body_style),
            Paragraph("<b>Relative Humidity:</b>", body_style),
            Paragraph(f"{env.get('relative_humidity_pct', 0.0)}%", body_style)
        ],
        [
            Paragraph("<b>Solar Irradiance:</b>", body_style),
            Paragraph(f"{env.get('solar_radiation_w_m2', 0.0)} W/m²", body_style),
            Paragraph("<b>Wind (10m):</b>", body_style),
            Paragraph(f"{env.get('wind_speed_ms', 0.0)} m/s @ {env.get('wind_direction_deg', 0)}°", body_style)
        ]
    ]

    t_site = Table(site_table_data, colWidths=[120, 150, 120, 150])
    t_site.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_site)
    story.append(Spacer(1, 10))

    # Thermal Comfort Comparison Table
    story.append(Paragraph("2. Thermal Comfort Performance (Universal Thermal Climate Index)", h2_style))

    thermal_table_data = [
        [
            Paragraph("<b>Configuration</b>", body_style),
            Paragraph("<b>Mean Radiant Temp (Tmrt)</b>", body_style),
            Paragraph("<b>UTCI (°C)</b>", body_style),
            Paragraph("<b>Stress Category</b>", body_style),
            Paragraph("<b>Comfort Score</b>", body_style)
        ],
        [
            Paragraph("Outdoor Ambient (Unshaded Sun)", body_style),
            Paragraph(f"{round(env.get('temperature_c', 30) + env.get('solar_radiation_w_m2', 600)/100 * 3.2, 1)}°C", body_style),
            Paragraph(f"{round(env.get('temperature_c', 30) + 12.0, 1)}°C", body_style),
            Paragraph("Severe / Extreme Heat", body_style),
            Paragraph("25 / 100", body_style)
        ],
        [
            Paragraph("Conventional Baseline (Bare GI Sheet)", body_style),
            Paragraph(f"{base.get('mean_radiant_temp_c', 0.0)}°C", body_style),
            Paragraph(f"{base.get('utci_c', 0.0)}°C", body_style),
            Paragraph(f"{base.get('stress_category', 'N/A')}", body_style),
            Paragraph(f"{base.get('comfort_score', 0)} / 100", body_style)
        ],
        [
            Paragraph(f"<b>Recommended: {opt.get('title', 'N/A')}</b>", body_style),
            Paragraph(f"<b>{opt.get('tmrt_c', 0.0)}°C</b>", body_style),
            Paragraph(f"<b>{opt.get('utci_c', 0.0)}°C</b>", body_style),
            Paragraph(f"<b>{opt.get('stress_category', 'N/A')}</b>", badge_style),
            Paragraph(f"<b>{opt.get('thermal_comfort_score', 0)} / 100</b>", badge_style)
        ]
    ]

    t_thermal = Table(thermal_table_data, colWidths=[150, 95, 75, 130, 90])
    t_thermal.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#eff6ff')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_thermal)
    story.append(Spacer(1, 10))

    # Selected Architecture Specifications
    story.append(Paragraph("3. Selected Shelter Architectural Specifications", h2_style))
    dims = opt.get("dimensions", {})
    roof = opt.get("roof", {})
    mats = opt.get("main_materials", {})

    specs_table_data = [
        [
            Paragraph("<b>Dimensions (L × W × H):</b>", body_style),
            Paragraph(f"{dims.get('length_m', 0)}m × {dims.get('width_m', 0)}m × {dims.get('height_m', 0)}m ({dims.get('floor_area_m2', 0)} m²)", body_style),
            Paragraph("<b>Shelter Orientation:</b>", body_style),
            Paragraph(f"{opt.get('orientation_deg', 0)}° azimuth", body_style)
        ],
        [
            Paragraph("<b>Roof Construction:</b>", body_style),
            Paragraph(f"{roof.get('type', 'N/A')} ({roof.get('overhang_m', 0)}m overhang)", body_style),
            Paragraph("<b>Ventilation Openings:</b>", body_style),
            Paragraph(f"{int(opt.get('openings_ratio', 0.5)*100)}% free area", body_style)
        ],
        [
            Paragraph("<b>Primary Roof Material:</b>", body_style),
            Paragraph(f"{mats.get('roof', 'N/A')}", body_style),
            Paragraph("<b>Structural Frame:</b>", body_style),
            Paragraph(f"{mats.get('structure', 'N/A')}", body_style)
        ],
        [
            Paragraph("<b>Solar Shading Element:</b>", body_style),
            Paragraph(f"{mats.get('shading', 'N/A')}", body_style),
            Paragraph("<b>Floor Plinth & Seating:</b>", body_style),
            Paragraph(f"{mats.get('floor', 'N/A')} / {mats.get('seating', 'N/A')}", body_style)
        ]
    ]

    t_specs = Table(specs_table_data, colWidths=[130, 140, 130, 140])
    t_specs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_specs)
    story.append(Spacer(1, 10))

    # Preliminary Cost & Bill of Quantities
    cost_info = opt.get("cost_breakdown", {})
    story.append(Paragraph(f"4. Preliminary Bill of Quantities (Grand Total: {cost_info.get('formatted_grand_total', 'N/A')})", h2_style))

    boq_table_data = [
        [
            Paragraph("<b>Component</b>", body_style),
            Paragraph("<b>Specification</b>", body_style),
            Paragraph("<b>Qty</b>", body_style),
            Paragraph("<b>Rate (₹)</b>", body_style),
            Paragraph("<b>Amount (₹)</b>", body_style)
        ]
    ]

    for item in cost_info.get("itemized_boq", [])[:6]:
        boq_table_data.append([
            Paragraph(item["component"], body_style),
            Paragraph(item["description"][:38] + "...", body_style),
            Paragraph(f"{item['quantity']} {item['unit']}", body_style),
            Paragraph(f"₹{item['unit_rate_inr']:,}", body_style),
            Paragraph(f"₹{item['total_cost_inr']:,}", body_style)
        ])

    boq_table_data.append([
        Paragraph("<b>Materials Subtotal:</b>", body_style),
        Paragraph("", body_style),
        Paragraph("", body_style),
        Paragraph("", body_style),
        Paragraph(f"<b>₹{cost_info.get('material_subtotal_inr', 0):,}</b>", body_style)
    ])
    boq_table_data.append([
        Paragraph("<b>Labor & Installation (28%):</b>", body_style),
        Paragraph("Standard pre-fabrication assembly", body_style),
        Paragraph("", body_style),
        Paragraph("", body_style),
        Paragraph(f"<b>₹{cost_info.get('labor_estimate_inr', 0):,}</b>", body_style)
    ])
    boq_table_data.append([
        Paragraph("<b>ESTIMATED GRAND TOTAL:</b>", body_style),
        Paragraph("", body_style),
        Paragraph("", body_style),
        Paragraph("", body_style),
        Paragraph(f"<b>{cost_info.get('formatted_grand_total', '₹0')}</b>", badge_style)
    ])

    t_boq = Table(boq_table_data, colWidths=[110, 190, 75, 75, 90])
    t_boq.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_boq)
    story.append(Spacer(1, 10))

    # Engineering Reasoning
    story.append(Paragraph("5. Deterministic Engineering Rationale", h2_style))
    for idx, r in enumerate(opt.get("reasoning", []), start=1):
        story.append(Paragraph(f"<b>[{idx}]</b> {r}", body_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 12))
    # Disclaimer
    disclaimer_text = (
        "<b>Engineering Disclaimer:</b> This document was generated by ThermoShelter, an automated research "
        "and computational decision-support tool. Microclimate calculations are based on "
        "the COST Action 730 Universal Thermal Climate Index (UTCI) formulation and CPWD preliminary schedules. "
        "Detailed structural, wind-load, soil foundation, and local statutory clearances must be conducted and validated "
        "by certified civil/structural professionals before procurement and physical construction."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
