import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Generate a random session code
function generateSessionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();

    if (!planId) {
      return Response.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Get plan details
    const [plan] = await sql.query('SELECT * FROM plans WHERE id = $1', [planId]);
    if (!plan) {
      return Response.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Create session
    const sessionCode = generateSessionCode();
    const [session] = await sql.query(
      'INSERT INTO sessions (plan_id, session_code, status, total_distributed, children_count) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [planId, sessionCode, 'active', 0, 0]
    );

    return Response.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return Response.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId');
    const sessionCode = searchParams.get('sessionCode');

    if (sessionCode) {
      const [session] = await sql.query('SELECT * FROM sessions WHERE session_code = $1', [sessionCode]);
      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }
      return Response.json(session);
    }

    if (planId) {
      const sessions = await sql.query('SELECT * FROM sessions WHERE plan_id = $1 ORDER BY created_at DESC', [planId]);
      return Response.json(sessions);
    }

    return Response.json({ error: 'Plan ID or Session Code is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return Response.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
