"""
Denetçi Doğrulama Servisi (Verification Service).
Bağımsız denetçilerin (Auditors) emisyon kayıtlarını onaylama/reddetme mantığını yönetir.
"""

# DB mock state (Gerçekte EmissionRecord modeline audit_status alanı eklenerek yönetilir)
verification_db = {
    "records": {}
}

def verify_record(record_id: int, auditor_name: str, status: str, notes: str = "") -> dict:
    """
    Belirli bir emisyon kaydının denetim durumunu günceller.
    status: 'verified' veya 'rejected'
    """
    if status not in ["verified", "rejected"]:
        raise ValueError("Geçersiz statü.")
        
    verification_db["records"][record_id] = {
        "status": status,
        "verified_by": auditor_name,
        "notes": notes
    }
    
    return {
        "record_id": record_id,
        "status": status,
        "verified_by": auditor_name,
        "message": f"Kayıt başarıyla {status} olarak işaretlendi."
    }

def get_audit_status(company_id: str) -> dict:
    """
    Şirketin genel doğrulama yüzdesini ve güncel denetim durumunu döner.
    """
    # Gerçekte DB'den o şirketin kayıtlı evraklarının (EmissionRecord/Evidence) statüleri sorgulanır.
    # Demo amaçlı %100 onaylı dönüyoruz.
    return {
        "company_id": company_id,
        "is_fully_verified": True,
        "verified_by": "PwC Sustainability Services",
        "verification_date": "2026-06-21",
        "completion_percentage": 100
    }
