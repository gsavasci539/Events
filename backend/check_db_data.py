from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from tabulate import tabulate

def get_db_connection():
    """Create and return a database connection"""
    DB_SERVER = "104.247.167.130,57673"
    DB_NAME = "yazil112_events"
    DB_USER = "yazil112_test2"
    DB_PASSWORD = "GURkan5391"
    DB_DRIVER = "ODBC+Driver+17+for+SQL+Server"
    
    DATABASE_URL = f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?driver={DB_DRIVER}"
    return create_engine(DATABASE_URL)

def check_tables(engine):
    """List all tables in the database"""
    inspector = inspect(engine)
    tables = inspector.get_table_names(schema='dbo')
    print("\n=== Database Tables ===")
    for table in tables:
        print(f"- {table}")
    return tables

def get_table_data(engine, table_name, limit=5):
    """Get sample data from a table"""
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT TOP {limit} * FROM {table_name}"))
        columns = result.keys()
        rows = result.fetchall()
        
        print(f"\n=== Sample data from '{table_name}' ===")
        if rows:
            print(tabulate(rows, headers=columns, tablefmt='grid'))
            print(f"Total rows: {len(rows)}")
        else:
            print("No data found")

def get_table_columns(engine, table_name):
    """Get column information for a table"""
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name, schema='dbo')
    print(f"\n=== Columns in '{table_name}' ===")
    for column in columns:
        print(f"- {column['name']} ({column['type']})")

def get_stats_data(engine):
    """Get data that should appear in the dashboard"""
    queries = {
        'Total Events': "SELECT COUNT(*) as count FROM events",
        'Total Guests': "SELECT COUNT(*) as count FROM guests",
        'Total Users': "SELECT COUNT(*) as count FROM users",
        'Total Notifications': "SELECT COUNT(*) as count FROM notification_logs"
    }
    
    print("\n=== Dashboard Statistics ===")
    for label, query in queries.items():
        with engine.connect() as conn:
            result = conn.execute(text(query))
            count = result.scalar()
            print(f"{label}: {count}")

def main():
    try:
        print("Connecting to database...")
        engine = get_db_connection()
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✓ Successfully connected to the database")
        
        # Get list of tables
        tables = check_tables(engine)
        
        # Get stats for dashboard
        get_stats_data(engine)
        
        # Check important tables
        for table in ['events', 'guests', 'users', 'notification_logs']:
            if table in tables:
                get_table_columns(engine, table)
                get_table_data(engine, table)
            else:
                print(f"\n⚠️ Table '{table}' not found in database!")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
    finally:
        if 'engine' in locals():
            engine.dispose()

if __name__ == "__main__":
    main()
