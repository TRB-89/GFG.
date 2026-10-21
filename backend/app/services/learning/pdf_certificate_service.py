import io
import qrcode
from PIL import Image
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from backend.app.models.learning import LmsCertificate


def generate_certificate_pdf(certificate: LmsCertificate) -> io.BytesIO:
    """
    Generates a high-resolution, downloadable A4 landscape PDF certificate
    incorporating GFG editorial branding, gold geometric framing,
    embedded verification QR code, and official governance seal.
    """
    buffer = io.BytesIO()
    width, height = landscape(A4)  # 841.89 x 595.27 points

    pdf = canvas.Canvas(buffer, pagesize=(width, height))
    pdf.setTitle(f"GFG_Certificate_{certificate.credential_id}")
    pdf.setAuthor("GFG — Gap For Good")
    pdf.setSubject("Official Certificate of Achievement")

    # 1. Background fill: Deep Luxury Obsidian / Dark Slate
    pdf.setFillColor(colors.HexColor("#121212"))
    pdf.rect(0, 0, width, height, fill=True, stroke=False)

    # 2. Outer & Inner Gold Accent Framing Borders
    # Outer thin border
    pdf.setStrokeColor(colors.HexColor("#D8C2A6"))
    pdf.setLineWidth(1.5)
    pdf.rect(20, 20, width - 40, height - 40)

    # Inner decorative thin border
    pdf.setStrokeColor(colors.HexColor("#A56F7C"))
    pdf.setLineWidth(0.75)
    pdf.rect(26, 26, width - 52, height - 52)

    # Corner ornamental brackets
    corner_size = 18
    pdf.setStrokeColor(colors.HexColor("#E2D4C3"))
    pdf.setLineWidth(2)
    # Top-Left
    pdf.line(23, height - 23, 23 + corner_size, height - 23)
    pdf.line(23, height - 23, 23, height - 23 - corner_size)
    # Top-Right
    pdf.line(width - 23, height - 23, width - 23 - corner_size, height - 23)
    pdf.line(width - 23, height - 23, width - 23, height - 23 - corner_size)
    # Bottom-Left
    pdf.line(23, 23, 23 + corner_size, 23)
    pdf.line(23, 23, 23, 23 + corner_size)
    # Bottom-Right
    pdf.line(width - 23, 23, width - 23 - corner_size, 23)
    pdf.line(width - 23, 23, width - 23, 23 + corner_size)

    # 3. Header: GFG Organization & Mission
    pdf.setFillColor(colors.HexColor("#D8C2A6"))
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawCentredString(width / 2.0, height - 60, "G F G  —  G A P   F O R   G O O D")

    pdf.setFillColor(colors.HexColor("#A56F7C"))
    pdf.setFont("Helvetica", 8)
    pdf.drawCentredString(width / 2.0, height - 74, "CAREER CONTINUITY, RETURN-TO-WORK & EMPOWERMENT ACADEMY")

    # Divider bar
    pdf.setStrokeColor(colors.HexColor("#D8C2A6"))
    pdf.setLineWidth(0.8)
    pdf.line(width / 2.0 - 120, height - 85, width / 2.0 + 120, height - 85)

    # 4. Heading: CERTIFICATE OF ACHIEVEMENT
    pdf.setFillColor(colors.HexColor("#FFFFFF"))
    pdf.setFont("Times-Bold", 26)
    pdf.drawCentredString(width / 2.0, height - 120, "CERTIFICATE OF ACHIEVEMENT")

    pdf.setFillColor(colors.HexColor("#B5A99B"))
    pdf.setFont("Times-Italic", 12)
    pdf.drawCentredString(width / 2.0, height - 146, "This is formally presented to")

    # 5. Recipient Name
    pdf.setFillColor(colors.HexColor("#F1E7DB"))
    pdf.setFont("Times-Bold", 28)
    pdf.drawCentredString(width / 2.0, height - 188, certificate.recipient_name)

    # Accent underline under name
    pdf.setStrokeColor(colors.HexColor("#A56F7C"))
    pdf.setLineWidth(1.5)
    name_width = pdf.stringWidth(certificate.recipient_name, "Times-Bold", 28)
    pdf.line(width / 2.0 - (name_width / 2.0) - 20, height - 196, width / 2.0 + (name_width / 2.0) + 20, height - 196)

    # 6. Course completion text
    pdf.setFillColor(colors.HexColor("#B5A99B"))
    pdf.setFont("Times-Roman", 11)
    pdf.drawCentredString(
        width / 2.0,
        height - 222,
        "for successfully completing all rigorous curriculum requirements, proctored assessments,"
    )
    pdf.drawCentredString(
        width / 2.0,
        height - 238,
        "and an approved practical capstone project under the specialized returnship program:"
    )

    # 7. Course Title
    pdf.setFillColor(colors.HexColor("#E2D4C3"))
    pdf.setFont("Helvetica-Bold", 19)
    pdf.drawCentredString(width / 2.0, height - 272, certificate.course_title.upper())

    # 8. Learning Outcomes Box
    outcomes = certificate.learning_outcomes or []
    if outcomes:
        pdf.setFillColor(colors.HexColor("#191919"))
        pdf.roundRect(width / 2.0 - 290, height - 378, 580, 85, 6, fill=True, stroke=False)
        pdf.setStrokeColor(colors.HexColor("#D8C2A6"))
        pdf.setLineWidth(0.5)
        pdf.roundRect(width / 2.0 - 290, height - 378, 580, 85, 6, fill=False, stroke=True)

        pdf.setFillColor(colors.HexColor("#D8C2A6"))
        pdf.setFont("Helvetica-Bold", 8.5)
        pdf.drawString(width / 2.0 - 275, height - 307, "VERIFIED LEARNING OUTCOMES & RETURN-TO-WORK COMPETENCIES:")

        pdf.setFillColor(colors.HexColor("#CCCCCC"))
        pdf.setFont("Helvetica", 8)
        y_out = height - 325
        for outcome in outcomes[:3]:
            # truncate cleanly if long
            disp_outcome = outcome if len(outcome) < 110 else outcome[:107] + "..."
            pdf.drawString(width / 2.0 - 270, y_out, f"•   {disp_outcome}")
            y_out -= 16

    # 9. Bottom Section: Signatories & Seals
    issue_date_str = certificate.issued_at.strftime("%B %d, %Y") if certificate.issued_at else "Verified"

    # Left: Date & Credential ID
    pdf.setFillColor(colors.HexColor("#E2D4C3"))
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(55, 125, "CREDENTIAL IDENTIFIER")
    pdf.setFont("Courier-Bold", 10)
    pdf.setFillColor(colors.HexColor("#FFFFFF"))
    pdf.drawString(55, 110, certificate.credential_id)

    pdf.setFillColor(colors.HexColor("#E2D4C3"))
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(55, 85, "DATE ISSUED")
    pdf.setFont("Helvetica", 9)
    pdf.setFillColor(colors.HexColor("#CCCCCC"))
    pdf.drawString(55, 70, issue_date_str)

    pdf.setFont("Helvetica", 7.5)
    pdf.setFillColor(colors.HexColor("#999999"))
    pdf.drawString(55, 52, "Verify authenticity at: " + certificate.verification_url[:48])

    # Center: Official Gold Seal Graphic
    seal_cx = width / 2.0
    seal_cy = 95
    # Outer circle
    pdf.setStrokeColor(colors.HexColor("#D8C2A6"))
    pdf.setLineWidth(1.5)
    pdf.circle(seal_cx, seal_cy, 36, fill=False, stroke=True)
    # Inner circle
    pdf.setStrokeColor(colors.HexColor("#A56F7C"))
    pdf.setLineWidth(0.8)
    pdf.circle(seal_cx, seal_cy, 31, fill=False, stroke=True)
    # Center text
    pdf.setFillColor(colors.HexColor("#F1E7DB"))
    pdf.setFont("Helvetica-Bold", 7)
    pdf.drawCentredString(seal_cx, seal_cy + 10, "OFFICIAL")
    pdf.drawCentredString(seal_cx, seal_cy - 1, "VERIFIED")
    pdf.setFont("Helvetica-Bold", 6.5)
    pdf.setFillColor(colors.HexColor("#A56F7C"))
    pdf.drawCentredString(seal_cx, seal_cy - 12, "★ GFG ★")

    # Right: Signature & Signatory
    right_x = width - 260
    pdf.setStrokeColor(colors.HexColor("#D8C2A6"))
    pdf.setLineWidth(1.0)
    pdf.line(right_x, 95, right_x + 190, 95)

    pdf.setFillColor(colors.HexColor("#FFFFFF"))
    pdf.setFont("Helvetica-Bold", 9.5)
    pdf.drawString(right_x, 80, certificate.issuer_signatory)

    pdf.setFillColor(colors.HexColor("#B5A99B"))
    pdf.setFont("Helvetica", 7.5)
    pdf.drawString(right_x, 67, certificate.issuer_name)

    pdf.setFillColor(colors.HexColor("#777777"))
    pdf.setFont("Helvetica-Oblique", 7)
    pdf.drawString(right_x, 52, "Issued under GFG DPDP-Compliant Credential Governance")

    # 10. Embedded QR Code on Bottom-Right
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=4,
            border=1
        )
        qr.add_data(certificate.verification_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")

        qr_stream = io.BytesIO()
        qr_img.save(qr_stream, format="PNG")
        qr_stream.seek(0)

        from reportlab.lib.utils import ImageReader
        img_reader = ImageReader(qr_stream)
        # Draw QR code in white rounded bounding box
        pdf.setFillColor(colors.HexColor("#FFFFFF"))
        pdf.roundRect(width - 65, 55, 45, 45, 3, fill=True, stroke=False)
        pdf.drawImage(img_reader, width - 63, 57, width=41, height=41)
    except Exception as e:
        pass

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer
