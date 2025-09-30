import pyodbc

def test_connection():
    try:
        # Database connection details
        server = '104.247.167.130,57673'
        database = 'yazil112_events'
        username = 'yazil112_test2'
        password = 'GURkan5391'
        
        # Create connection string
        conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={username};"
            f"PWD={password};"
            "TrustServerCertificate=yes;"
        )
        
        # Connect to the database
        print("Connecting to the database...")
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # Get table names
        print("\n=== Database Tables ===")
        tables = [row.table_name for row in cursor.tables(tableType='TABLE')]
        for table in tables:
            print(f"- {table}")
        
        # Get row counts for important tables
        print("\n=== Row Counts ===")
        for table in ['events', 'guests', 'users', 'notification_logs']:
            if table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"{table}: {count} rows")
            else:
                print(f"Table '{table}' not found!")
        
        # Show some sample data
        print("\n=== Sample Data ===")
        for table in ['events', 'guests', 'users']:
            if table in tables:
                try:
                    cursor.execute(f"SELECT TOP 3 * FROM {table}")
                    rows = cursor.fetchall()
                    print(f"\nSample from {table}:")
                    if rows:
                        columns = [column[0] for column in cursor.description]
                        print(" | ".join(columns))
                        for row in rows:
                            print(" | ".join(str(x) for x in row))
                except Exception as e:
                    print(f"Error reading from {table}: {str(e)}")
        
        conn.close()
        print("\nDatabase connection closed.")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_connection()
