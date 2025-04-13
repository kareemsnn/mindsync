-- Enable the pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS vault;

-- Store API endpoint in vault (execute this only once)
SELECT vault.create_secret(
  'api_endpoint', 
  'https://mindsync-v1-cb054f8af12c.herokuapp.com'
);

-- Function to process expired questions and send data to API
CREATE OR REPLACE FUNCTION process_expired_questions()
RETURNS void AS $$
DECLARE
    expire_date TIMESTAMP;
    current_time TIMESTAMP := NOW();
    question_id INT;
    api_endpoint TEXT;
    user_rec RECORD;
    user_answers TEXT[];
    question_ids INT[] := ARRAY[]::INT[];
BEGIN
    -- Get API endpoint from vault
    SELECT secret::text INTO api_endpoint FROM vault.secrets WHERE name = 'api_endpoint';
    
    -- Exit if API endpoint not found
    IF api_endpoint IS NULL THEN
        RAISE EXCEPTION 'API endpoint not found in vault';
        RETURN;
    END IF;

    -- Get the expiry date from fdate table
    SELECT f.expire_date INTO expire_date FROM fdate f ORDER BY id DESC LIMIT 1;
    
    -- Exit if no expiry date found or it hasn't passed yet
    IF expire_date IS NULL OR expire_date > current_time THEN
        RAISE NOTICE 'Expiry date not yet reached or not found. Current: %, Expiry: %', current_time, expire_date;
        RETURN;
    END IF;
    
    -- Process each non-expired question
    FOR question_id IN 
        SELECT id FROM questions WHERE is_expired = false
    LOOP
        question_ids := array_append(question_ids, question_id);
    END LOOP;
    
    -- Exit if no non-expired questions found
    IF array_length(question_ids, 1) IS NULL THEN
        RAISE NOTICE 'No non-expired questions found.';
        RETURN;
    END IF;
    
    -- Get user answers grouped by user_id for non-expired questions
    FOR user_rec IN
        SELECT 
            a.user_id,
            array_agg(a.answer) as answers
        FROM 
            answers a
        WHERE 
            a.question_id = ANY(question_ids)
        GROUP BY 
            a.user_id
        HAVING 
            COUNT(a.id) > 0
    LOOP
        -- Prepare user answers data
        user_answers := user_rec.answers;
        
        -- Send data to API using pg_net
        PERFORM net.http_post(
            url := api_endpoint || '/classifyUser',
            headers := jsonb_build_object(
                'Content-Type', 'application/json'
            ),
            body := jsonb_build_object(
                'user_id', user_rec.user_id,
                'texts', array_to_json(user_answers)
            )::TEXT,
            timeout_milliseconds := 30000
        );
        
        RAISE NOTICE 'Sent data for user % with % answers', user_rec.user_id, array_length(user_answers, 1);
    END LOOP;
    
    -- Mark all non-expired questions as expired
    UPDATE questions SET is_expired = true WHERE id = ANY(question_ids);
    RAISE NOTICE 'Marked % questions as expired', array_length(question_ids, 1);
    
END;
$$ LANGUAGE plpgsql;

-- To run this function, you would schedule it using Supabase's pg_cron:
-- SELECT cron.schedule('process-expired-questions', '*/5 * * * *', 'SELECT process_expired_questions()');
-- This would run the function every 5 minutes 