import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { sessionId, childOrder, questionId, finalAmount, status } = await req.json();

    if (!sessionId || !finalAmount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [reward] = await sql.query(
      'INSERT INTO rewards (session_id, child_order, question_id, final_amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sessionId, childOrder || 0, questionId || null, finalAmount, status || 'completed']
    );

    // Update session statistics
    await sql.query(
      'UPDATE sessions SET total_distributed = total_distributed + $1, children_count = children_count + 1 WHERE id = $2',
      [finalAmount, sessionId]
    );

    return Response.json(reward, { status: 201 });
  } catch (error) {
    console.error('Error creating reward:', error);
    return Response.json({ error: 'Failed to create reward' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return Response.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const rewards = await sql.query(
      'SELECT * FROM rewards WHERE session_id = $1 ORDER BY created_at ASC',
      [parseInt(sessionId)]
    );

    return Response.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return Response.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}
