# Expiration Scheduler Cron Job

This cron job handles the expiration process for questions in the Supabase database. It runs at regular intervals to check if the global expiration date has been reached, and if so, processes user answers and marks questions as expired.

## Setup

1. Install dependencies:
   ```
   npm install @supabase/supabase-js axios node-cron dotenv
   ```

2. Configure environment variables in `.env` file:
   ```
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_KEY=your_supabase_anon_key_here
   API_ENDPOINT=http://your-api-server/api
   ```

3. Start the cron job:
   ```
   node cron.js
   ```

## How it works

1. The cron job runs every 10 seconds and checks the `fdate` table for the global expiration date.
2. If the current time has passed the expiration date:
   - It fetches all non-expired questions and their answers
   - For users with 10 or more answers, it sends their data to the classification API
   - All questions are marked as expired after processing

## API Integration

The job sends user answers to the `/classifyUser` endpoint with the following JSON format:
```json
{
  "user_id": 123,
  "texts": ["Answer 1", "Answer 2", "..."]
}
```

This format matches the `ClassificationRequest` model expected by the API. 