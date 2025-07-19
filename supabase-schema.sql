-- CLOSED AI Database Schema for Supabase
-- This schema supports workflows, forking, attribution, and scheduling

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    credits_balance DECIMAL(10,2) DEFAULT 100.00,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flow categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main flows table
CREATE TABLE flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    creator_id UUID REFERENCES profiles(id),
    
    -- Fork information
    original_flow_id UUID REFERENCES flows(id), -- NULL if original
    fork_generation INTEGER DEFAULT 0, -- 0 = original, 1 = direct fork, etc.
    
    -- Flow definition
    inputs JSONB NOT NULL, -- FormField[] schema
    outputs JSONB NOT NULL, -- Output schema
    runtime JSONB NOT NULL, -- Runtime configuration
    
    -- Metadata
    version TEXT DEFAULT '1.0.0',
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Statistics
    execution_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    popularity_score DECIMAL(3,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flow attribution tracking
CREATE TABLE flow_attributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID REFERENCES flows(id),
    contributor_id UUID REFERENCES profiles(id),
    contribution_type TEXT CHECK (contribution_type IN ('original', 'fork', 'improvement', 'bug_fix')),
    attribution_percentage DECIMAL(5,2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flow executions
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID REFERENCES flows(id),
    user_id UUID REFERENCES profiles(id),
    
    -- Execution data
    inputs JSONB NOT NULL,
    outputs JSONB,
    model_used TEXT,
    
    -- Status and metrics
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    credits_used DECIMAL(10,4) DEFAULT 0.0000,
    execution_time_ms INTEGER,
    error_message TEXT,
    
    -- Scheduling (if applicable)
    scheduled_execution_id UUID,
    is_scheduled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Scheduled executions
CREATE TABLE scheduled_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID REFERENCES flows(id),
    user_id UUID REFERENCES profiles(id),
    
    -- Schedule configuration
    schedule_type TEXT CHECK (schedule_type IN ('once', 'hourly', 'daily', 'weekly', 'custom')),
    cron_expression TEXT, -- For custom schedules
    next_run_at TIMESTAMP WITH TIME ZONE,
    
    -- Execution configuration
    inputs JSONB NOT NULL,
    model_id TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_execution_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    amount DECIMAL(10,4) NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('purchase', 'execution', 'refund', 'bonus')),
    reference_id UUID, -- execution_id, purchase_id, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model registry
CREATE TABLE ai_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    cost_per_token DECIMAL(10,8) NOT NULL,
    max_tokens INTEGER,
    capabilities TEXT[], -- ['text', 'vision', 'code']
    speed_tier TEXT CHECK (speed_tier IN ('fast', 'medium', 'slow')),
    quality_tier TEXT CHECK (quality_tier IN ('basic', 'high', 'highest')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User flow collections (like playlists)
CREATE TABLE flow_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE flow_collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES flow_collections(id),
    flow_id UUID REFERENCES flows(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, flow_id)
);

-- Flow ratings and reviews
CREATE TABLE flow_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID REFERENCES flows(id),
    user_id UUID REFERENCES profiles(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(flow_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_flows_creator ON flows(creator_id);
CREATE INDEX idx_flows_category ON flows(category_id);
CREATE INDEX idx_flows_public ON flows(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_flows_featured ON flows(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_flows_fork_chain ON flows(original_flow_id);
CREATE INDEX idx_executions_user ON executions(user_id);
CREATE INDEX idx_executions_flow ON executions(flow_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_scheduled_active ON scheduled_executions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_scheduled_next_run ON scheduled_executions(next_run_at) WHERE is_active = TRUE;

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Flows: Public flows are viewable by all, private flows only by creator
CREATE POLICY "Public flows are viewable by all" ON flows FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users can view own flows" ON flows FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users can create flows" ON flows FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own flows" ON flows FOR UPDATE USING (auth.uid() = creator_id);

-- Executions: Users can only see their own executions
CREATE POLICY "Users can view own executions" ON executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own executions" ON executions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scheduled executions: Users can only manage their own schedules
CREATE POLICY "Users can view own schedules" ON scheduled_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own schedules" ON scheduled_executions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedules" ON scheduled_executions FOR UPDATE USING (auth.uid() = user_id);

-- Credit transactions: Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Functions for common operations
CREATE OR REPLACE FUNCTION update_flow_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update execution count when an execution completes
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE flows 
        SET execution_count = execution_count + 1,
            updated_at = NOW()
        WHERE id = NEW.flow_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_flow_stats
    AFTER UPDATE ON executions
    FOR EACH ROW
    EXECUTE FUNCTION update_flow_stats();

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
    p_user_id UUID,
    p_amount DECIMAL(10,4),
    p_reference_id UUID,
    p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance DECIMAL(10,2);
BEGIN
    -- Check current balance
    SELECT credits_balance INTO current_balance
    FROM profiles 
    WHERE id = p_user_id;
    
    IF current_balance >= p_amount THEN
        -- Deduct credits
        UPDATE profiles 
        SET credits_balance = credits_balance - p_amount,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        -- Record transaction
        INSERT INTO credit_transactions (user_id, amount, transaction_type, reference_id, description)
        VALUES (p_user_id, -p_amount, 'execution', p_reference_id, p_description);
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert default data
INSERT INTO categories (name, description, icon) VALUES
    ('Text Analysis', 'Analyze and process text content', '📝'),
    ('NLP', 'Natural Language Processing workflows', '🧠'),
    ('Vision', 'Image and video processing', '👁️'),
    ('Translation', 'Multi-language translation', '🌍'),
    ('Development', 'Code analysis and generation', '💻'),
    ('Custom', 'User-created categories', '🎨');

INSERT INTO ai_models (id, name, provider, cost_per_token, max_tokens, capabilities, speed_tier, quality_tier) VALUES
    ('gpt-4', 'GPT-4', 'OpenAI', 0.00003, 4096, '{text,vision}', 'medium', 'highest'),
    ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'OpenAI', 0.000002, 4096, '{text}', 'fast', 'high'),
    ('claude-3', 'Claude 3', 'Anthropic', 0.000025, 4096, '{text}', 'medium', 'highest'),
    ('gemini-pro', 'Gemini Pro', 'Google', 0.0000005, 4096, '{text,vision}', 'fast', 'high');

-- Comments
COMMENT ON TABLE flows IS 'Main flows table storing workflow definitions and metadata';
COMMENT ON TABLE flow_attributions IS 'Tracks attribution chain for forked flows';
COMMENT ON TABLE executions IS 'Individual workflow executions with results';
COMMENT ON TABLE scheduled_executions IS 'Scheduled/recurring workflow executions';
COMMENT ON COLUMN flows.fork_generation IS 'Generation number: 0=original, 1=direct fork, 2=fork of fork, etc.';
COMMENT ON COLUMN flows.popularity_score IS 'Calculated score based on usage, ratings, and forks'; 