-- SQL Server Turkish Character Support Configuration
-- Run this script to ensure proper Turkish character support
-- Database: yazil112_events

USE yazil112_events;
GO

-- Check current database collation
SELECT name, collation_name
FROM sys.databases
WHERE name = 'yazil112_events';
GO

-- Check current table collations
SELECT t.name AS table_name, c.name AS column_name, c.collation_name, t.name AS data_type
FROM sys.tables t
JOIN sys.columns c ON t.object_id = c.object_id
WHERE c.collation_name IS NOT NULL
AND t.name IN ('users', 'events', 'activity_logs')
ORDER BY t.name, c.name;
GO

-- Update users table collation for Turkish support
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'users' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Update collation for text columns to support Turkish characters
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'full_name')
    BEGIN
        ALTER TABLE dbo.users
        ALTER COLUMN full_name NVARCHAR(255) COLLATE Turkish_CI_AS;
        PRINT 'Updated users.full_name collation for Turkish character support';
    END

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'email')
    BEGIN
        ALTER TABLE dbo.users
        ALTER COLUMN email NVARCHAR(255) COLLATE Turkish_CI_AS;
        PRINT 'Updated users.email collation for Turkish character support';
    END
END
GO

-- Update events table collation for Turkish support
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'events' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Update collation for text columns to support Turkish characters
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.events') AND name = 'title')
    BEGIN
        ALTER TABLE dbo.events
        ALTER COLUMN title NVARCHAR(255) COLLATE Turkish_CI_AS;
        PRINT 'Updated events.title collation for Turkish character support';
    END

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.events') AND name = 'description')
    BEGIN
        ALTER TABLE dbo.events
        ALTER COLUMN description NVARCHAR(MAX) COLLATE Turkish_CI_AS;
        PRINT 'Updated events.description collation for Turkish character support';
    END

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.events') AND name = 'location')
    BEGIN
        ALTER TABLE dbo.events
        ALTER COLUMN location NVARCHAR(255) COLLATE Turkish_CI_AS;
        PRINT 'Updated events.location collation for Turkish character support';
    END
END
GO

-- Update activity_logs table collation for Turkish support
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'activity_logs' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Update collation for text columns to support Turkish characters
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.activity_logs') AND name = 'detail')
    BEGIN
        ALTER TABLE dbo.activity_logs
        ALTER COLUMN detail NVARCHAR(MAX) COLLATE Turkish_CI_AS;
        PRINT 'Updated activity_logs.detail collation for Turkish character support';
    END
END
GO

-- Verify the changes
SELECT 'AFTER UPDATE - Turkish Character Support Verification' as status;
SELECT t.name AS table_name, c.name AS column_name, c.collation_name
FROM sys.tables t
JOIN sys.columns c ON t.object_id = c.object_id
WHERE c.collation_name = 'Turkish_CI_AS'
ORDER BY t.name, c.name;
GO

PRINT 'Turkish character support configuration completed!';
PRINT 'Database is now configured to properly handle Turkish characters (ç, ğ, ı, ö, ş, ü, İ, Ğ, Ş)';
GO
