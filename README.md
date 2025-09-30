# Herbalife Distributor Events System

Bu proje, Herbalife distribütörlerinin etkinliklerini yönetmek için oluşturulmuş bir yönetim paneli ve API'dir.

## Özellikler

- **Kullanıcı Yönetimi**: Distribütör ve süper yönetici rolleri
- **Etkinlik Yönetimi**: Etkinlik oluşturma, düzenleme, silme
- **Davetli Yönetimi**: Toplu davetli ekleme (CSV/Excel)
- **Bildirim Sistemi**: E-posta ve WhatsApp üzerinden otomatik bildirimler
- **Raporlama**: Etkinlik ve katılım istatistikleri

## Kurulum

### Ön Gereksinimler

- Python 3.9+
- Node.js 18+
- MSSQL Server (veya Azure SQL)
- Windows için ODBC Driver 17 for SQL Server

### Backend Kurulumu

1. Backend dizinine gidin:
   ```powershell
   cd backend
   ```

2. Sanal ortam oluşturup etkinleştirin:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Bağımlılıkları yükleyin:
   ```powershell
   pip install -r requirements.txt
   ```

4. `.env` dosyası oluşturun:
   ```powershell
   copy .env.example .env
   ```
   Ardından `.env` dosyasını düzenleyerek veritabanı bağlantı bilgilerinizi güncelleyin.

5. Veritabanı tablolarını oluşturun:
   ```powershell
   python scripts/reset_db.py
   ```

6. Sunucuyu başlatın:
   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Kurulumu

1. Frontend dizinine gidin:
   ```powershell
   cd frontend
   ```

2. Bağımlılıkları yükleyin:
   ```powershell
   npm install
   ```

3. `.env` dosyası oluşturun:
   ```powershell
   copy .env.example .env
   ```
   Eğer backend farklı bir portta çalışıyorsa `VITE_API_BASE_URL` değerini güncelleyin.

4. Geliştirme sunucusunu başlatın:
   ```powershell
   npm run dev
   ```

## Kullanım

1. Uygulamayı tarayıcıda açın: http://localhost:5173
2. İlk kullanıcıyı oluşturmak için backend API'sini kullanın:
   ```bash
   curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "sifre123", "role": "superadmin", "full_name": "Admin User"}'
   ```
3. Oluşturduğunuz bilgilerle giriş yapın.

## Dağıtım

### Backend (Production)

```powershell
# Uvicorn ile production (Windows için)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# VEYA gunicorn ile (Linux/Unix)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

### Frontend (Production)

```powershell
# Production build oluştur
npm run build

# Statik dosyaları servis etmek için (örneğin nginx ile)
# /etc/nginx/sites-available/herbalife-events

server {
    listen 80;
    server_name example.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Katkıda Bulunma

1. Forklayın (https://github.com/yourusername/herbalife-events/fork)
2. Yeni bir branch oluşturun (`git checkout -b feature/foo-bar`)
3. Değişikliklerinizi commit edin (`git commit -am 'Add some fooBar'`)
4. Branch'e pushlayın (`git push origin feature/foo-bar`)
5. Pull Request oluşturun

## Lisans

MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakınız.
