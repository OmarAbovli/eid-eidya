import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { sessionId, childOrder, questionId, finalAmount, status } = await req.json();

    if (!sessionId || !finalAmount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedSessionId = parseInt(sessionId, 10);
    const parsedAmount = parseInt(finalAmount, 10);
    if (isNaN(parsedSessionId) || parsedSessionId <= 0 || isNaN(parsedAmount) || parsedAmount <= 0) {
      return Response.json({ error: 'Invalid session ID or amount' }, { status: 400 });
    }

    // Validate session and plan budget in a transaction
    const [session] = await sql.query('SELECT * FROM sessions WHERE id = $1', [parsedSessionId]);
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.status !== 'active') {
      return Response.json({ error: 'Session is not active' }, { status: 400 });
    }

    const [plan] = await sql.query('SELECT * FROM plans WHERE id = $1', [session.plan_id]);
    if (!plan) {
      return Response.json({ error: 'Associated plan not found' }, { status: 404 });
    }

    // Check if amount is a valid denomination
    const [denom] = await sql.query(
      'SELECT value FROM denominations WHERE plan_id = $1 AND value = $2',
      [plan.id, parsedAmount]
    );
    if (!denom) {
      return Response.json({ error: 'Amount is not a valid denomination for this plan' }, { status: 400 });
    }

    // Check budget limit
    const totalDistributed = Number(session.total_distributed) || 0;
    const totalAmount = Number(plan.total_amount) || 0;
    if (totalDistributed + parsedAmount > totalAmount) {
      return Response.json({ error: 'Plan budget exceeded' }, { status: 400 });
    }

    const [reward] = await sql.query(
      'INSERT INTO rewards (session_id, child_order, question_id, final_amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [parsedSessionId, childOrder || 0, questionId || null, parsedAmount, status || 'completed']
    );

    await sql.query(
      'UPDATE sessions SET total_distributed = total_distributed + $1, children_count = children_count + 1 WHERE id = $2',
      [parsedAmount, parsedSessionId]
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

    const parsedId = parseInt(sessionId, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      return Response.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const rewards = await sql.query(
      'SELECT * FROM rewards WHERE session_id = $1 ORDER BY created_at ASC',
      [parsedId]
    );

    return Response.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return Response.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}
