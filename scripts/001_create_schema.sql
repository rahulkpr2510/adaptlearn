-- AdaptLearn SaaS Database Schema
-- This script creates all necessary tables for the SaaS application

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  quizzes_completed INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Allow public read for leaderboard (limited fields)
CREATE POLICY "profiles_select_leaderboard" ON public.profiles 
  FOR SELECT USING (true);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  track TEXT NOT NULL CHECK (track IN ('dsa', 'sql', 'javascript')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_taken_seconds INTEGER,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz_attempts
CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Topic mastery table
CREATE TABLE IF NOT EXISTS public.topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  track TEXT NOT NULL CHECK (track IN ('dsa', 'sql', 'javascript')),
  topic TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track, topic)
);

-- Enable RLS on topic_mastery
ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;

-- RLS policies for topic_mastery
CREATE POLICY "topic_mastery_select_own" ON public.topic_mastery 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "topic_mastery_insert_own" ON public.topic_mastery 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "topic_mastery_update_own" ON public.topic_mastery 
  FOR UPDATE USING (auth.uid() = user_id);

-- Activity feed table
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('quiz_completed', 'streak_achieved', 'badge_earned', 'level_up', 'subscription_changed')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on activity_feed
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity_feed
CREATE POLICY "activity_feed_select_own" ON public.activity_feed 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activity_feed_insert_own" ON public.activity_feed 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streak', 'mastery', 'completion', 'special')),
  requirement_value INTEGER DEFAULT 1
);

-- User badges (earned badges)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_badges
CREATE POLICY "user_badges_select_own" ON public.user_badges 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_badges_insert_own" ON public.user_badges 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily activity tracking for streaks
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quizzes_taken INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, activity_date)
);

-- Enable RLS on daily_activity
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_activity
CREATE POLICY "daily_activity_select_own" ON public.daily_activity 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_activity_insert_own" ON public.daily_activity 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_activity_update_own" ON public.daily_activity 
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (id, name, description, icon, category, requirement_value) VALUES
  ('streak-3', 'Getting Started', 'Maintain a 3-day streak', 'flame', 'streak', 3),
  ('streak-7', 'Week Warrior', 'Maintain a 7-day streak', 'flame', 'streak', 7),
  ('streak-30', 'Monthly Master', 'Maintain a 30-day streak', 'flame', 'streak', 30),
  ('streak-100', 'Century Champion', 'Maintain a 100-day streak', 'crown', 'streak', 100),
  ('quiz-10', 'Quiz Novice', 'Complete 10 quizzes', 'target', 'completion', 10),
  ('quiz-50', 'Quiz Expert', 'Complete 50 quizzes', 'target', 'completion', 50),
  ('quiz-100', 'Quiz Master', 'Complete 100 quizzes', 'trophy', 'completion', 100),
  ('points-1000', 'Rising Star', 'Earn 1,000 points', 'star', 'special', 1000),
  ('points-10000', 'Super Star', 'Earn 10,000 points', 'star', 'special', 10000),
  ('dsa-master', 'DSA Expert', 'Achieve 80% mastery in DSA', 'code', 'mastery', 80),
  ('sql-master', 'SQL Expert', 'Achieve 80% mastery in SQL', 'database', 'mastery', 80),
  ('js-master', 'JavaScript Expert', 'Achieve 80% mastery in JavaScript', 'braces', 'mastery', 80)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_user_id ON public.topic_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON public.profiles(current_streak DESC);
