import logging
import httpx
from typing import Optional, Dict, Any
from backend.app.config.settings import settings

logger = logging.getLogger("gfg.email_service")

class EmailService:
    def __init__(self, api_key: Optional[str] = None, from_email: Optional[str] = None):
        self.api_key = api_key or settings.RESEND_API_KEY
        self.from_email = from_email or settings.RESEND_FROM_EMAIL or "GFG Academy <onboarding@resend.dev>"

    async def _send_resend_email(self, to: str, subject: str, html: str) -> Dict[str, Any]:
        """
        Sends an email using Resend REST API (https://api.resend.com/emails).
        """
        if not self.api_key:
            logger.info(f"[EmailService Fallback] No RESEND_API_KEY set. Simulated email to {to}: {subject}")
            return {
                "id": "simulated_email_id",
                "status": "simulated",
                "to": to,
                "subject": subject
            }

        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "from": self.from_email,
            "to": [to],
            "subject": subject,
            "html": html
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code in (200, 201):
                    data = res.json()
                    logger.info(f"Email sent via Resend to {to}: id={data.get('id')}")
                    return data
                else:
                    logger.warning(f"Resend error {res.status_code}: {res.text}")
                    return {
                        "error": res.text,
                        "status_code": res.status_code,
                        "status": "failed"
                    }
        except Exception as e:
            logger.error(f"Failed to dispatch email via Resend: {e}")
            return {
                "error": str(e),
                "status": "exception"
            }

    async def send_certificate_email(
        self,
        to_email: str,
        recipient_name: str,
        course_title: str,
        credential_id: str,
        verification_url: str,
        pdf_download_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends an official GFG Certificate of Achievement notification.
        """
        subject = f"🎓 Your GFG Certificate of Achievement: {course_title}"
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #111111;
      color: #F1E7DB;
      margin: 0;
      padding: 30px 15px;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      background-color: #181818;
      border: 1px solid rgba(216, 194, 166, 0.25);
      border-radius: 16px;
      padding: 36px 30px;
    }}
    .header {{
      border-bottom: 1px solid rgba(216, 194, 166, 0.15);
      padding-bottom: 20px;
      margin-bottom: 25px;
    }}
    .brand {{
      font-size: 20px;
      font-weight: 300;
      letter-spacing: 0.1em;
      color: #F1E7DB;
    }}
    .badge {{
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #A56F7C;
      font-family: monospace;
      margin-top: 4px;
    }}
    h1 {{
      font-size: 24px;
      font-weight: 400;
      color: #F1E7DB;
      margin-top: 0;
      line-height: 1.3;
    }}
    p {{
      color: #CCCCCC;
      line-height: 1.6;
      font-size: 14px;
    }}
    .credential-box {{
      background-color: #121212;
      border: 1px dashed rgba(216, 194, 166, 0.35);
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
    }}
    .cred-label {{
      font-size: 10px;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #A56F7C;
      margin-bottom: 4px;
    }}
    .cred-id {{
      font-family: monospace;
      font-size: 15px;
      color: #D8C2A6;
      font-weight: bold;
    }}
    .btn {{
      display: inline-block;
      background-color: #D8C2A6;
      color: #111111;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      padding: 12px 24px;
      border-radius: 8px;
      margin-right: 12px;
      margin-top: 10px;
    }}
    .btn-secondary {{
      background-color: transparent;
      color: #F1E7DB;
      border: 1px solid rgba(216, 194, 166, 0.4);
    }}
    .footer {{
      margin-top: 35px;
      padding-top: 20px;
      border-top: 1px solid rgba(216, 194, 166, 0.1);
      font-size: 11px;
      color: #777777;
      line-height: 1.5;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">GFG // GAP FOR GOOD</div>
      <div class="badge">ACADEMY & VERIFIED CREDENTIAL SYSTEM</div>
    </div>

    <h1>Congratulations, {recipient_name}!</h1>
    
    <p>
      You have successfully met all requirements and earned an official 
      <strong>GFG Certificate of Achievement</strong> for completing:
    </p>

    <div style="font-size: 17px; color: #D8C2A6; font-weight: 500; margin: 15px 0;">
      {course_title}
    </div>

    <p>
      This credential authenticates 100% completion of mandatory coursework, 
      successful evaluation of the server-scored final assessment, and formal mentor approval 
      of your practical capstone project.
    </p>

    <div class="credential-box">
      <div class="cred-label">Unique Credential Identifier</div>
      <div class="cred-id">{credential_id}</div>
      <div style="font-size: 11px; color: #888888; margin-top: 8px;">
        Issuer: GFG — Gap For Good • DPDP Act (India 2023) Compliant
      </div>
    </div>

    <div>
      <a href="{verification_url}" class="btn">Verify Credential Online</a>
      {f'<a href="{pdf_download_url}" class="btn btn-secondary">Download PDF</a>' if pdf_download_url else ''}
    </div>

    <div class="footer">
      This credential was issued by GFG — Gap For Good to support women re-entering the workforce. 
      It can be shared with returnship employers, LinkedIn profiles, or verified by public recruiters at the verification link above.
    </div>
  </div>
</body>
</html>
"""
        return await self._send_resend_email(to=to_email, subject=subject, html=html)

    async def send_assignment_feedback_email(
        self,
        to_email: str,
        recipient_name: str,
        course_title: str,
        status: str,
        feedback: str
    ) -> Dict[str, Any]:
        """
        Sends practical assignment review feedback.
        """
        is_approved = status == "approved"
        status_label = "Approved ✓" if is_approved else "Feedback Provided / Revision Requested"
        subject = f"GFG Capstone Review: {status_label} for {course_title}"

        html = f"""
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #111; color: #F1E7DB; padding: 25px;">
  <div style="max-width: 600px; margin: 0 auto; background: #181818; padding: 30px; border-radius: 14px; border: 1px solid rgba(216,194,166,0.25);">
    <div style="font-size: 11px; color: #A56F7C; font-family: monospace; letter-spacing: 0.2em;">GFG CAPSTONE EVALUATION</div>
    <h2 style="color: #F1E7DB; margin-top: 5px;">Capstone Project Evaluation: {status_label}</h2>
    <p>Dear {recipient_name},</p>
    <p>Your practical capstone submission for <strong>{course_title}</strong> has been reviewed by the GFG mentor panel.</p>
    
    <div style="background: #121212; border-left: 3px solid {'#10b981' if is_approved else '#A56F7C'}; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 6px;">Evaluator Feedback:</div>
      <div style="color: #E2D4C3; font-size: 14px; line-height: 1.5;">{feedback}</div>
    </div>

    <p style="font-size: 13px; color: #888;">
      {'You have satisfied the practical project milestone toward your GFG Certificate of Achievement!' if is_approved else 'You may review this feedback and submit an updated project in the GFG Learning Hub.'}
    </p>
  </div>
</body>
</html>
"""
        return await self._send_resend_email(to=to_email, subject=subject, html=html)

email_service = EmailService()
