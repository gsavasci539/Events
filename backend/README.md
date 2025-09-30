# Herbalife Events Backend (FastAPI)

## Quick start

1. Create `.env` from `.env.example` and set values (especially `DB_CONN`).
2. Create venv and install dependencies:

```powershell
py -3 -m venv venv
venv\Scripts\activate
python -m pip install -U pip
pip install -r backend/requirements.txt
```

3. Run the API:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

4. Reset DB (drop + recreate):

```powershell
python backend/scripts/reset_db.py
```

## Notes
- Uses MSSQL via `pyodbc`. Ensure "ODBC Driver 17 for SQL Server" is installed on Windows.
- JWT-based auth at `/api/auth/login` (OAuth2 Password flow). Register via `/api/auth/register`.
