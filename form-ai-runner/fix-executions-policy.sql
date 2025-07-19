-- Fix missing INSERT policy for executions table
-- This resolves the "Failed to create execution record" error

-- Ensure RLS is enabled
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can create own executions" ON executions;

-- Create the INSERT policy for executions
CREATE POLICY "Users can create own executions" ON executions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also ensure UPDATE policy exists for execution status updates
DROP POLICY IF EXISTS "Users can update own executions" ON executions;
CREATE POLICY "Users can update own executions" ON executions 
FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT INSERT, UPDATE, SELECT ON executions TO authenticated;

-- Test the policy by checking if policies exist
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'executions'; 