import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get('difficulty');
    const limit = searchParams.get('limit') || '100';
    const planId = searchParams.get('planId');
    const excludeIdsParam = searchParams.get('excludeIds') || '';
    const excludeIds = excludeIdsParam
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => Number.isFinite(id) && id > 0);

    let query = 'SELECT * FROM questions WHERE is_global = true';
    const params: any[] = [];

    if (difficulty) {
      params.push(difficulty);
      query += ` AND difficulty_level = $${params.length}`;
    }

    // If planId is provided, include global + plan-specific questions
    if (planId) {
      const mergedQuestions = await sql.query(
        `
        WITH merged AS (
          SELECT q.*
          FROM questions q
          INNER JOIN plan_questions pq ON q.id = pq.question_id
          WHERE pq.plan_id = $1
          UNION
          SELECT *
          FROM questions
          WHERE is_global = true
        )
        SELECT *
        FROM merged
        WHERE ($2::text IS NULL OR difficulty_level = $2)
          AND (
            COALESCE(array_length($3::int[], 1), 0) = 0
            OR id != ALL($3::int[])
          )
        ORDER BY RANDOM()
        LIMIT $4
        `,
        [parseInt(planId), difficulty, excludeIds, parseInt(limit, 10)]
      );

      return Response.json(mergedQuestions);
    }

    if (excludeIds.length > 0) {
      params.push(excludeIds);
      query += ` AND id != ALL($${params.length}::int[])`;
    }

    params.push(parseInt(limit));
    query += ` LIMIT $${params.length}`;

    const questions = await sql.query(query, params);
    return Response.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return Response.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { text, correctAnswer, optionA, optionB, optionC, optionD, difficultyLevel, planId } = await req.json();

    if (!text || !correctAnswer || !optionA || !optionB || !optionC || !optionD) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [question] = await sql.query(
      'INSERT INTO questions (text, correct_answer, option_a, option_b, option_c, option_d, difficulty_level, is_global, plan_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        text,
        correctAnswer,
        optionA,
        optionB,
        optionC,
        optionD,
        difficultyLevel || 'medium',
        !planId,
        planId || null,
      ]
    );

    return Response.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return Response.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
