// cron.js
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const apiEndpoint = process.env.API_ENDPOINT;

// Validate environment variables
if (!supabaseUrl || !supabaseKey || !apiEndpoint) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Cron job to run every 10 seconds
cron.schedule('*/10 * * * * *', async () => {
  console.log('Cron job started...');
  try {
    // Query the fdate table for expire_date
    const { data: fdateData, error: fdateError } = await supabase
      .from('fdate')
      .select('expire_date');

    if (fdateError) {
      console.error('Error querying fdate table:', fdateError);
      return;
    }

    // Ensure expire_date is valid
    const endDateString = fdateData[0]?.expire_date;
    if (!endDateString) {
      console.error('No expire_date found in fdate table.');
      return;
    }

    const expiryDate = new Date(endDateString);
    if (isNaN(expiryDate)) {
      console.error('Fetched expiry date is invalid:', endDateString);
      return;
    }

    // Check if the current time has passed the expiry date
    const now = new Date();
    if (expiryDate < now) {
      console.log('The global expire_date has passed. Processing expired questions...');

      // Query ALL questions that are not expired
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, question, answers(id, user_id, answer)')
        .eq('is_expired', false);

      if (questionsError) {
        console.error('Error querying questions:', questionsError);
        return;
      }

      // Prepare a map to collect answers by user ID
      const userAnswersMap = {};

      // Organize answers by user ID
      for (const question of questionsData) {
        if (question.answers && question.answers.length > 0) {
          for (const answer of question.answers) {
            const userId = answer.user_id;
            const answerText = answer.answer;

            if (!userAnswersMap[userId]) {
              userAnswersMap[userId] = [];
            }
            userAnswersMap[userId].push(answerText);
          }
        }
      }

      // Send data to API for users with 1 or more answers using correct format
      for (const [userId, answers] of Object.entries(userAnswersMap)) {
        if (answers.length > 0) {
          console.log(`Sending data for user ${userId} with ${answers.length} answers`);
          try {
            const payload = {
              user_id: parseInt(userId),
              texts: answers
            };
            
            const response = await axios.post(`${apiEndpoint}/classifyUser`, payload);
            if (response.status !== 200) {
              console.error(`Failed to send data for user ${userId}:`, response.data);
            } else {
              console.log(`Successfully sent data for user ${userId}.`);
            }
          } catch (apiError) {
            console.error(`Error sending data to API for user ${userId}:`, apiError);
          }
        } else {
          console.log(`Skipping user ${userId} who only has ${answers.length} answers (less than 10)`);
        }
      }

      // Update all questions to set is_expired to true
      if (questionsData.length > 0) {
        const questionIds = questionsData.map(question => question.id);
        const { error: updateError } = await supabase
          .from('questions')
          .update({ is_expired: true })
          .in('id', questionIds);
        
        if (updateError) {
          console.error('Error updating questions as expired:', updateError);
        } else {
          console.log(`Successfully marked ${questionIds.length} questions as expired.`);
        }
      }
    } else {
      console.log(`Expiry date not yet reached. Current: ${now.toISOString()}, Expiry: ${expiryDate.toISOString()}`);
    }
  } catch (error) {
    console.error('Error running cron job:', error);
  }
});