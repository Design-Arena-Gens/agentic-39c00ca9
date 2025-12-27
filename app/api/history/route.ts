import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, getChatHistory } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const user = getOrCreateUser(username);
    const history = getChatHistory(user.id, 100).reverse();

    return NextResponse.json({
      user_id: user.id,
      username: user.username,
      messages: history,
    });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
