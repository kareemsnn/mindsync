// cron.js
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import cron from 'node-cron';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// API endpoint to send data
const apiEndpoint = 'YOUR_API_ENDPOINT';

// Cron job to run every 10 seconds
cron.schedule('*/10 * * * * *', async () => {
    console.log('Cron job started...'); // Log when the job starts
    try {
        // Query the fdate table for expire_date
        console.log('Querying fdate table for expire_date...');
        const { data: fdateData, error: fdateError } = await supabase
            .from('fdate')
            .select('*'); // Select all columns

        if (fdateError) {
            console.error('Error querying fdate table:', fdateError);
            return;
        }

        // Log the fetched data from fdate
        console.log('Fetched fdate data:', fdateData); // Log the contents of fdateData

        // Ensure expire_date is valid
        const endDateString = fdateData[0]?.expire_date; // Using the correct column name
        if (!endDateString) {
            console.error('No expire_date found in fdate table.');
            return;
        }

        const expiryDate = new Date(endDateString);
        if (isNaN(expiryDate)) {
            console.error('Fetched expiry date is invalid:', endDateString);
            return;
        }
        console.log('Fetched expiry date:', expiryDate); // Log the fetched expiry date

        // Check if the current time has passed the expiry date
        const now = new Date();
        if (expiryDate < now) {
            console.log('The global expire_date has passed. Fetching all non-expired questions...');

            // Query ALL questions that are not expired
            const { data: questionsData, error: questionsError } = await supabase
                .from('questions')
                .select('id, question, answers(id, user_id, answer)')
                .eq('is_expired', false);

            if (questionsError) {
                console.error('Error querying questions:', questionsError);
                return;
            }

            console.log(`Found ${questionsData.length} non-expired questions.`);

            // Prepare a map to collect answers by user ID
            const userAnswersMap = {};
            console.log('Organizing answers by user ID...');

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

            console.log('User answers organized:', userAnswersMap); // Log the organized answers

            // First, send data to API only for users with 10 or more answers
            for (const [userId, answers] of Object.entries(userAnswersMap)) {
                // Check if the user has 10 or more answers
                if (answers.length >= 10) {
                    console.log(`Sending data for user ${userId} with ${answers.length} answers`);
                    try {
                        const response = await axios.post(apiEndpoint, { userId, answers });
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

            // Then, update all questions to set is_expired to true
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
            } else {
                console.log('No questions to mark as expired.');
            }
        } else {
            console.log('The global expire_date has not yet passed. No action needed.');
            console.log(`Current time: ${now.toISOString()}, Expiry date: ${expiryDate.toISOString()}`);
        }
    } catch (error) {
        console.error('Error running cron job:', error);
    }
});