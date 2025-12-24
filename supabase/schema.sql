-- SCOPE+ Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth, but we can add custom fields)
-- The auth.users table is automatically created by Supabase

-- Stage 0: User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  strengths TEXT[],
  learning_style TEXT,
  interests TEXT[],
  fears TEXT[],
  decision_style TEXT,
  uncertainty_tolerance TEXT,
  current_subjects TEXT[],
  cca_activities TEXT[],
  year_level INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage 1: Role Swipes
CREATE TABLE IF NOT EXISTS role_swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,
  swipe_direction TEXT NOT NULL CHECK (swipe_direction IN ('left', 'right', 'up')),
  swipe_speed FLOAT,
  card_tap_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage 2: Course Selections
CREATE TABLE IF NOT EXISTS course_selections (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  semester TEXT NOT NULL,
  selected_combination TEXT,
  course_list JSONB NOT NULL,
  total_workload INTEGER,
  alignment_score FLOAT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage 3: Growth Reports
CREATE TABLE IF NOT EXISTS growth_reports (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  north_star TEXT,
  skills_current JSONB,
  skill_evolution_path JSONB,
  unique_edge TEXT,
  recommended_next JSONB,
  conversation_transcript JSONB,
  voice_analytics JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage 4: Tournament Results
CREATE TABLE IF NOT EXISTS tournament_results (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  round1_winners TEXT[],
  round2_winners TEXT[],
  final_specializations JSONB,
  eliminated JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage 5: Storyboards
CREATE TABLE IF NOT EXISTS storyboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timeline TEXT NOT NULL,
  title TEXT,
  panels JSONB NOT NULL,
  pathway_steps TEXT[],
  confidence_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stage TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_swipes_user_id ON role_swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_stage ON chat_messages(stage);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own swipes" ON role_swipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swipes" ON role_swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own courses" ON course_selections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses" ON course_selections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON growth_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON growth_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tournament" ON tournament_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tournament" ON tournament_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own storyboards" ON storyboards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storyboards" ON storyboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

