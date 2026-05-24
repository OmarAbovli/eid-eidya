CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Default User',
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  num_children INTEGER NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS denominations (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  is_global BOOLEAN NOT NULL DEFAULT TRUE,
  plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_questions (
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (plan_id, question_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  session_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  total_distributed NUMERIC(12, 2) NOT NULL DEFAULT 0,
  children_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  child_order INTEGER NOT NULL DEFAULT 0,
  question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
  final_amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_denominations_plan_id ON denominations(plan_id);
CREATE INDEX IF NOT EXISTS idx_sessions_plan_id ON sessions(plan_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_code ON sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_rewards_session_id ON rewards(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty_level ON questions(difficulty_level);

INSERT INTO users (name, email)
SELECT 'Default User', 'default@eid.local'
WHERE NOT EXISTS (SELECT 1 FROM users);

INSERT INTO questions (text, correct_answer, option_a, option_b, option_c, option_d, difficulty_level, is_global)
SELECT *
FROM (
  VALUES
    ('كم عدد أيام عيد الأضحى؟', 'أربعة أيام', 'يومان', 'ثلاثة أيام', 'أربعة أيام', 'خمسة أيام', 'easy', TRUE),
    ('ما الركن الذي يختص بالحج في الإسلام؟', 'الحج', 'الصلاة', 'الزكاة', 'الصوم', 'الحج', 'easy', TRUE),
    ('ما اسم اليوم العاشر من ذي الحجة؟', 'يوم النحر', 'يوم عرفة', 'يوم التروية', 'يوم التشريق', 'يوم النحر', 'medium', TRUE),
    ('في أي يوم يقف الحجاج بعرفة؟', 'التاسع من ذي الحجة', 'الثامن', 'التاسع من ذي الحجة', 'العاشر', 'الحادي عشر', 'medium', TRUE),
    ('كم عدد رميات الجمرات في أيام التشريق (للمتعجل يومين)؟', '49', '21', '35', '49', '70', 'hard', TRUE)
) AS seed(text, correct_answer, option_a, option_b, option_c, option_d, difficulty_level, is_global)
WHERE NOT EXISTS (SELECT 1 FROM questions);
