-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing job if it exists
SELECT cron.unschedule('process-expired-questions');

-- Schedule the job to run every 5 minutes
SELECT cron.schedule(
    'process-expired-questions',     -- unique job name
    '*/5 * * * *',                  -- cron schedule (every 5 minutes)
    'SELECT process_expired_questions()'  -- SQL command to execute
);

-- To verify the job is scheduled:
-- SELECT * FROM cron.job; 