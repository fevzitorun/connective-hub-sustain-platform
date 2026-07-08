"""
E-posta servisi — rapor onayı, davet, şablon bildirimleri.
SMTP tabanlı (Gmail / Zoho / Sendgrid SMTP ile çalışır).
"""
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings


def _build_html(title: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><title>{title}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#166534;padding:24px 32px;">
      <h1 style="color:white;margin:0;font-size:20px;">🌿 SustainHub</h1>
      <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px;">sustainhub.online</p>
    </div>
    <div style="padding:32px;">
      {body_html}
    </div>
    <div style="padding:16px 32px;background:#f3f4f6;font-size:12px;color:#6b7280;text-align:center;">
      Bu e-posta SustainHub tarafından otomatik gönderilmiştir.<br>
      <a href="https://sustainhub.online" style="color:#166534;">sustainhub.online</a>
    </div>
  </div>
</body>
</html>"""


def send_email(to: str, subject: str, body_html: str) -> bool:
    """Tek e-posta gönder. Başarılı ise True döner."""
    if not getattr(settings, "smtp_host", None):
        # SMTP yapılandırılmamış — geliştirme ortamında log'a yaz
        print(f"[EMAIL STUB] To: {to} | Subject: {subject}")
        return True

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"[SustainHub] {subject}"
    msg["From"] = getattr(settings, "smtp_user", "noreply@sustainhub.online")
    msg["To"] = to

    html_content = _build_html(subject, body_html)
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        context = ssl.create_default_context()
        smtp_port = int(getattr(settings, "smtp_port", 587))
        smtp_host = settings.smtp_host

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(msg["From"], to, msg.as_string())
        return True
    except Exception as exc:
        print(f"[EMAIL ERROR] {exc}")
        return False


# --- Hazır e-posta şablonları ---

def send_report_ready(to: str, company_name: str, report_standard: str, report_id: str) -> bool:
    body = f"""
    <h2 style="color:#166534;">Raporunuz Hazır ✅</h2>
    <p>Merhaba,</p>
    <p><strong>{company_name}</strong> adına oluşturulan
    <strong>{report_standard.upper()}</strong> raporu başarıyla tamamlandı.</p>
    <a href="https://sustainhub.online/raporlar/{report_id}"
       style="display:inline-block;margin:16px 0;padding:12px 24px;background:#166534;
              color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
      Raporu Görüntüle
    </a>
    <p style="color:#6b7280;font-size:13px;">
      Raporu indirmek, paylaşmak veya onay sürecine göndermek için platforma giriş yapın.
    </p>
    """
    return send_email(to, f"{report_standard.upper()} Raporunuz Hazır", body)


def send_report_submitted_for_approval(
    admin_email: str, submitter_name: str, report_id: str
) -> bool:
    body = f"""
    <h2 style="color:#1e40af;">Rapor Onay Bekliyor 📋</h2>
    <p>Merhaba,</p>
    <p><strong>{submitter_name}</strong> bir raporu onayınıza sundu.</p>
    <a href="https://sustainhub.online/raporlar/{report_id}"
       style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1e40af;
              color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
      Raporu İncele ve Onayla
    </a>
    """
    return send_email(admin_email, "Rapor Onay Bekliyor", body)


def send_report_approved(to: str, report_id: str, approver_name: str) -> bool:
    body = f"""
    <h2 style="color:#166534;">Raporunuz Onaylandı ✅</h2>
    <p>Merhaba,</p>
    <p>Raporunuz <strong>{approver_name}</strong> tarafından onaylandı ve yayınlanmaya hazır.</p>
    <a href="https://sustainhub.online/raporlar/{report_id}"
       style="display:inline-block;margin:16px 0;padding:12px 24px;background:#166534;
              color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
      Raporu Görüntüle
    </a>
    """
    return send_email(to, "Raporunuz Onaylandı", body)


def send_user_invite(
    to: str, company_name: str, inviter_name: str, role: str, invite_token: str
) -> bool:
    body = f"""
    <h2 style="color:#166534;">SustainHub'a Davet Edildiniz 🌿</h2>
    <p>Merhaba,</p>
    <p><strong>{inviter_name}</strong>, sizi <strong>{company_name}</strong> hesabına
    <strong>{role}</strong> rolüyle davet etti.</p>
    <a href="https://sustainhub.online/register?token={invite_token}"
       style="display:inline-block;margin:16px 0;padding:12px 24px;background:#166534;
              color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
      Daveti Kabul Et
    </a>
    <p style="color:#6b7280;font-size:13px;">Bu davet 72 saat içinde geçerliliğini yitirir.</p>
    """
    return send_email(to, f"{company_name} — SustainHub Daveti", body)
