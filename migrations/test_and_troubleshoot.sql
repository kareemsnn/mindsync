-- Test queries for the process_expired_questions function

-- 1. Verify vault secret is stored correctly
SELECT * FROM vault.secrets WHERE name = 'api_endpoint';

-- 2. Test the function manually (execute function without scheduling)
-- This is useful for testing without waiting for the schedule
SELECT process_expired_questions();

-- 3. View scheduled jobs
SELECT * FROM cron.job;

-- 4. Check job run history
SELECT * FROM cron.job_run_details 
WHERE jobname = 'process-expired-questions' 
ORDER BY start_time DESC LIMIT 10;

-- 5. View pg_net request status
SELECT * FROM net.http_request_queue;

-- 6. View recent pg_net request results
SELECT * FROM net.http_response_headers ORDER BY id DESC LIMIT 5;

-- 7. Check non-expired questions count
SELECT COUNT(*) FROM questions WHERE is_expired = false;

-- 8. View fdate table content
SELECT * FROM fdate ORDER BY id DESC LIMIT 1;

-- 9. Manual query to find users with answers to specific questions
-- Useful for testing the data aggregation logic
SELECT 
    a.user_id,
    array_agg(a.answer) as answers,
    COUNT(a.id) as answer_count
FROM 
    answers a
JOIN 
    questions q ON a.question_id = q.id
WHERE 
    q.is_expired = false
GROUP BY 
    a.user_id
ORDER BY 
    answer_count DESC; 