import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get('isPublic');
    const userId = searchParams.get('userId');
    const planId = searchParams.get('planId');

    let query = 'SELECT * FROM plans';
    const params: any[] = [];

    if (planId) {
      const parsedId = parseInt(planId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        return Response.json({ error: 'Invalid plan ID' }, { status: 400 });
      }
      params.push(parsedId);
      query += ' WHERE id = $1';
    } else if (isPublic === 'true') {
      query += ' WHERE is_public = true ORDER BY created_at DESC';
    } else if (userId) {
      const parsedId = parseInt(userId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        return Response.json({ error: 'Invalid user ID' }, { status: 400 });
      }
      params.push(parsedId);
      query += ' WHERE user_id = $1 ORDER BY created_at DESC';
    } else {
      query += ' WHERE is_public = true ORDER BY created_at DESC';
    }

    const plans = await sql.query(query, params);

    // Fetch denominations and question counts for each plan
    const plansWithDetails = await Promise.all(
      plans.map(async (plan) => {
        const [denominations, questionCount] = await Promise.all([
          sql.query('SELECT value FROM denominations WHERE plan_id = $1 ORDER BY value DESC', [plan.id]),
          sql.query('SELECT COUNT(*) as count FROM plan_questions WHERE plan_id = $1', [plan.id]),
        ]);
        return {
          ...plan,
          denominations: denominations.map((d) => d.value),
          questionCount: questionCount[0]?.count || 0,
        };
      })
    );

    return Response.json(plansWithDetails);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return Response.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, name, totalAmount, numChildren, description, denominations, questionIds, isPublic } = await req.json();

    // Validate input
    if (!name || !totalAmount || !numChildren || !denominations?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const existingUsers = await sql.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
      effectiveUserId = existingUsers[0]?.id;
    }

    if (!effectiveUserId) {
      return Response.json(
        { error: 'No user available. Please add a user first in database.' },
        { status: 400 }
      );
    }

    // Create plan
    const [plan] = await sql.query(
      'INSERT INTO plans (user_id, name, total_amount, num_children, description, is_public) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [effectiveUserId, name, totalAmount, numChildren, description, isPublic || false]
    );

    // Validate and insert denominations
    const validDenoms = denominations
      .map((d: any) => parseInt(d, 10))
      .filter((d: number) => !isNaN(d) && d > 0)
      .filter((d: number, i: number, arr: number[]) => arr.indexOf(d) === i);
    if (validDenoms.length === 0) {
      return Response.json({ error: 'No valid denominations provided' }, { status: 400 });
    }
    if (validDenoms.length > 20) {
      return Response.json({ error: 'Too many denominations (max 20)' }, { status: 400 });
    }
    for (const denom of validDenoms) {
      await sql.query('INSERT INTO denominations (plan_id, value) VALUES ($1, $2)', [plan.id, denom]);
    }

    // Insert plan questions if provided
    if (questionIds && questionIds.length > 0) {
      for (const qId of questionIds) {
        await sql.query('INSERT INTO plan_questions (plan_id, question_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [plan.id, qId]);
      }
    }

    return Response.json({ id: plan.id, message: 'Plan created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return Response.json(
      {
        error: 'Failed to create plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
