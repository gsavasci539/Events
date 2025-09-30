-- Add first_name column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns 
               WHERE object_id = OBJECT_ID('dbo.users') 
               AND name = 'first_name')
BEGIN
    ALTER TABLE dbo.users ADD first_name NVARCHAR(100) NULL;
    PRINT 'Added first_name column';
END
ELSE
    PRINT 'first_name column already exists';

-- Add last_name column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns 
               WHERE object_id = OBJECT_ID('dbo.users') 
               AND name = 'last_name')
BEGIN
    ALTER TABLE dbo.users ADD last_name NVARCHAR(100) NULL;
    PRINT 'Added last_name column';
END
ELSE
    PRINT 'last_name column already exists';

-- Verify the columns were added
SELECT name, system_type_name, is_nullable
FROM sys.dm_exec_describe_first_result_set('SELECT * FROM dbo.users', NULL, 1)
WHERE name IN ('first_name', 'last_name');
