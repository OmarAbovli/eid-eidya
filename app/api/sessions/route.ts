import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

function generateSessionCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();

    if (!planId) {
      return Response.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const parsedPlanId = parseInt(planId, 10);
    if (isNaN(parsedPlanId) || parsedPlanId <= 0) {
      return Response.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    const [plan] = await sql.query('SELECT * FROM plans WHERE id = $1', [parsedPlanId]);
    if (!plan) {
      return Response.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check total distributed across all sessions for this plan
    const [budgetResult] = await sql.query(
      'SELECT COALESCE(SUM(total_distributed), 0) as total_used FROM sessions WHERE plan_id = $1',
      [parsedPlanId]
    );
    const totalUsed = Number(budgetResult.total_used) || 0;
    const planTotal = Number(plan.total_amount) || 0;
    if (totalUsed >= planTotal) {
      return Response.json({ error: 'Plan budget has been fully used' }, { status: 400 });
    }

    const sessionCode = generateSessionCode();
    const [session] = await sql.query(
      'INSERT INTO sessions (plan_id, session_code, status, total_distributed, children_count) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [parsedPlanId, sessionCode, 'active', 0, 0]
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
      const parsedId = parseInt(planId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        return Response.json({ error: 'Invalid plan ID' }, { status: 400 });
      }
      const sessions = await sql.query('SELECT * FROM sessions WHERE plan_id = $1 ORDER BY created_at DESC', [parsedId]);
      return Response.json(sessions);
    }

    return Response.json({ error: 'Plan ID or Session Code is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return Response.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
