"""
OCR Servisi (Claude 3.5 Sonnet Vision)
Tedarikçi faturalarını okuyup yapılandırılmış JSON verisine çevirir.
"""
import base64
import json
import os
import httpx
from typing import Optional

async def process_invoice(image_bytes: bytes) -> Optional[dict]:
    """
    Fatura görselini alır, Claude Vision API kullanarak analiz eder.
    Beklenen JSON yapısı:
    {
      "Tüketim Miktarı": float,
      "Birim": "kWh" | "m3" | "kg" | "Litre",
      "Dönem": "YYYY-MM",
      "Abone No": "string"
    }
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    # Eğer key yoksa demo verisi döndür (sistemin çalışması için mock)
    if not api_key:
        return {
            "Tüketim Miktarı": 1250.50,
            "Birim": "kWh",
            "Dönem": "2024-05",
            "Abone No": "1002345678"
        }

    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    prompt = """Sen bir enerji uzmanısın. Ekli faturadaki tüketim verilerini oku ve SADECE aşağıdaki JSON formatında yanıt dön. Ek açıklama yapma.
Eğer veri okunamıyorsa alanlara null yaz.
{
  "Tüketim Miktarı": sayı,
  "Birim": "kWh" veya "m3" veya "kg" veya "Litre",
  "Dönem": "YYYY-MM",
  "Abone No": "string"
}"""

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 512,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg", # Varsayılan jpeg kabul edelim veya png
                            "data": base64_image
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            text_result = data["content"][0]["text"]
            
            # Extract JSON block if surrounded by markdown code block
            if "```json" in text_result:
                text_result = text_result.split("```json")[1].split("```")[0]
            elif "```" in text_result:
                text_result = text_result.split("```")[1].split("```")[0]
                
            return json.loads(text_result.strip())
            
    except Exception as e:
        print(f"OCR Error: {e}")
        return None
