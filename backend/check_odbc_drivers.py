#!/usr/bin/env python3
"""
ODBC Driver Check and Database Connection Test

This script checks available ODBC drivers and tests database connection.
"""

import pyodbc
import sys

def check_odbc_drivers():
    """Check available ODBC drivers"""
    print("🔍 Checking available ODBC drivers...")
    try:
        drivers = pyodbc.drivers()
        if drivers:
            print("✅ Available ODBC drivers:")
            for i, driver in enumerate(drivers, 1):
                print(f"  {i}. {driver}")
        else:
            print("❌ No ODBC drivers found!")

        return drivers
    except Exception as e:
        print(f"❌ Error checking ODBC drivers: {e}")
        return []

def test_connection_with_driver(driver_name):
    """Test connection with specific driver"""
    DB_SERVER = "104.247.167.130,57673"
    DB_NAME = "yazil112_events"
    DB_USER = "yazil112_test2"
    DB_PASSWORD = "GURkan5391"

    try:
        conn_str = f"DRIVER={{{driver_name}}};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASSWORD};CHARSET=UTF8;"
        print(f"🔌 Testing connection with '{driver_name}'...")
        print(f"   Connection string: {conn_str.replace(DB_PASSWORD, '***')}")

        conn = pyodbc.connect(conn_str)
        print(f"✅ Successfully connected with '{driver_name}'!")

        # Test a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()
        print(f"📊 SQL Server version: {version[0]}")

        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Failed with '{driver_name}': {e}")
        return False

def main():
    print("🚀 ODBC Driver Check and Database Connection Test")
    print("=" * 60)

    drivers = check_odbc_drivers()

    if not drivers:
        print("\n❌ No ODBC drivers available!")
        print("\n🔧 To fix this issue:")
        print("1. Download and install 'ODBC Driver 17 for SQL Server' from Microsoft")
        print("   Download: https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server")
        print("2. Or install 'SQL Server Native Client' if using older SQL Server")
        print("3. Restart your computer after installation")
        sys.exit(1)

    print(f"\n🔍 Found {len(drivers)} ODBC drivers")

    # Test common SQL Server drivers
    sql_drivers = [d for d in drivers if 'SQL Server' in d or 'SQL' in d]

    if sql_drivers:
        print("
🎯 Testing SQL Server drivers..."        for driver in sql_drivers:
            if test_connection_with_driver(driver):
                print(f"\n✅ Recommended driver: {driver}")
                break
        else:
            print("\n❌ None of the SQL Server drivers worked")
    else:
        print("
❌ No SQL Server drivers found in the list"        print("Available drivers:", drivers)

    # Try generic connection methods
    print("
🔧 Trying alternative connection methods..."    test_connection_with_driver("SQL Server")
    test_connection_with_driver("SQL Server Native Client 11.0")
    test_connection_with_driver("SQL Server Native Client 10.0")

if __name__ == "__main__":
    main()
