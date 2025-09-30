#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Turkish Character Database Test Script
Bu script Türkçe karakterlerin veritabanında doğru kaydedilip kaydedilmediğini test eder.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal
from app.models.user import User
from app.core.config import settings

def test_turkish_characters():
    """Test Turkish character support in database"""
    print("🇹🇷 Türkçe Karakter Testi Başlatılıyor...")

    # Test data with Turkish characters
    test_names = [
        "Ahmet Yılmaz",
        "Fatma Çelik",
        "Mehmet Özgür",
        "Ayşe Güneş",
        "Mustafa Şahin",
        "Zeynep Ünal",
        "Emre Erdoğan",
        "İrem Kaya",
        "Canan Aksoy",
        "Hakan Demir"
    ]

    db = SessionLocal()
    try:
        print(f"📊 Database: {settings.DB_NAME}")
        print(f"🔗 Connection: {settings.DB_CONN}")
        print()

        # Create a test user with Turkish name
        test_user = User(
            email="test@example.com",
            full_name="Test User ğışçöü",
            hashed_password="hashed_password",
            role="distributor"
        )

        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        print("✅ Test kullanıcısı oluşturuldu:")
        print(f"   ID: {test_user.id}")
        print(f"   Email: {test_user.email}")
        print(f"   Full Name: {test_user.full_name}")
        print(f"   Role: {test_user.role}")
        print()

        # Test reading Turkish characters
        users_with_turkish_names = db.query(User).filter(
            User.full_name.like('%ğ%') |
            User.full_name.like('%ı%') |
            User.full_name.like('%ş%') |
            User.full_name.like('%ç%') |
            User.full_name.like('%ö%') |
            User.full_name.like('%ü%')
        ).all()

        print(f"🇹🇷 Türkçe karakter içeren kullanıcılar: {len(users_with_turkish_names)}")
        for user in users_with_turkish_names:
            print(f"   - {user.full_name} (ID: {user.id})")
        print()

        # Test updating with Turkish characters
        test_user.full_name = "Güncellenmiş İsim çğıöşü"
        db.commit()

        print("✅ Türkçe karakter güncellemesi başarılı:")
        print(f"   Yeni isim: {test_user.full_name}")
        print()

        # Cleanup
        db.delete(test_user)
        db.commit()

        print("🧹 Test verisi temizlendi")
        print("✅ Türkçe karakter testi başarıyla tamamlandı!")

    except Exception as e:
        print(f"❌ Hata oluştu: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_turkish_characters()
