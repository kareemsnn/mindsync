-- Group archiving utility functions and test queries
-- This file contains SQL commands for managing group expirations and testing archived chat functionality

-- Function to set a group as expired or active (already created)
-- Usage: SELECT public.set_group_expiration(group_id, days_from_now);
/*
CREATE OR REPLACE FUNCTION public.set_group_expiration(
  group_id_param INTEGER,
  days_from_now INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF days_from_now IS NULL THEN
    -- Set to null (never expires)
    UPDATE public.groups
    SET expires_at = NULL
    WHERE id = group_id_param;
  ELSE
    -- Set expiration date to specified days from now
    UPDATE public.groups
    SET expires_at = NOW() + (days_from_now || ' days')::INTERVAL
    WHERE id = group_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql;
*/

-- Examples for testing:

-- 1. Set a group to expire in 30 days (active)
SELECT public.set_group_expiration(1, 30);

-- 2. Set a group to expire in 1 minute (will become archived very quickly for testing)
SELECT public.set_group_expiration(1, 0.0007); -- ~1 minute

-- 3. Make a group expire immediately (archived)
UPDATE public.groups
SET expires_at = NOW() - INTERVAL '1 second'
WHERE id = 1;

-- 4. Set a group to never expire
SELECT public.set_group_expiration(1, NULL);

-- 5. Test expiring multiple groups at different times
-- First group expires in 7 days
UPDATE public.groups 
SET expires_at = NOW() + INTERVAL '7 days' 
WHERE id = 1;

-- Second group expired 3 days ago
UPDATE public.groups 
SET expires_at = NOW() - INTERVAL '3 days' 
WHERE id = 2;

-- Third group never expires
UPDATE public.groups 
SET expires_at = NULL 
WHERE id = 3;

-- Verify group status
SELECT id, name, description, 
       expires_at,
       CASE 
           WHEN expires_at IS NULL THEN 'active (never expires)'
           WHEN expires_at > NOW() THEN 'active'
           ELSE 'archived'
       END AS status
FROM public.groups
WHERE id IN (1, 2, 3);

-- RLS policy test queries (these match what's been applied)
/*
-- Enable RLS on the groups table
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for messages insert
DROP POLICY IF EXISTS "Users can create messages in groups they belong to" ON public.messages;

-- Create new policy allowing users to send messages ONLY to non-expired groups they are members of
CREATE POLICY "Users can send messages to active groups only" 
ON public.messages
FOR INSERT 
WITH CHECK (
  group_id IN (
    SELECT g.id 
    FROM public.groups g
    JOIN public.group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = auth.uid()
    AND (g.expires_at IS NULL OR g.expires_at > NOW())
  )
);

-- Create policy allowing users to delete their own messages in non-expired groups
CREATE POLICY "Users can delete their own messages in active groups" 
ON public.messages
FOR DELETE 
USING (
  user_id = auth.uid()
  AND group_id IN (
    SELECT g.id 
    FROM public.groups g
    WHERE (g.expires_at IS NULL OR g.expires_at > NOW())
  )
);

-- Create policy allowing users to update their own messages in non-expired groups
CREATE POLICY "Users can update their own messages in active groups" 
ON public.messages
FOR UPDATE 
USING (
  user_id = auth.uid()
  AND group_id IN (
    SELECT g.id 
    FROM public.groups g
    WHERE (g.expires_at IS NULL OR g.expires_at > NOW())
  )
);
*/ 