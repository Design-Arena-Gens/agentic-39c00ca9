import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, saveMessage, getChatHistory } from '@/lib/db';
import { generateAIResponse } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { username, message } = await request.json();

    if (!username || !message) {
      return NextResponse.json({ error: 'Username and message are required' }, { status: 400 });
    }

    // Get or create user
    const user = getOrCreateUser(username);

    // Save user message
    saveMessage(user.id, 'user', message);

    // Get chat history for context
    const history = getChatHistory(user.id, 10).reverse();
    const historyForAI = history.map(h => ({ role: h.role, content: h.content }));

    // Generate AI response
    const aiResponse = await generateAIResponse(message, historyForAI);

    // Save AI response
    saveMessage(user.id, 'assistant', aiResponse);

    return NextResponse.json({
      response: aiResponse,
      user_id: user.id,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
