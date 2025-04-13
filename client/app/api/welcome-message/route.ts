import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate a friendly and engaging welcome message for a new group chat. 
    The message should:
    - Be warm and welcoming
    - Encourage members to introduce themselves
    - Keep it concise (2-3 sentences)
    - Be professional but friendly
    - End with a question to spark conversation`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const message = response.text();

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error generating welcome message:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to generate welcome message' },
      { status: 500 }
    );
  }
} 