-- Complete database setup and workflow addition
-- This handles both initial setup and workflow addition

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table if it doesn't exist  
CREATE TABLE IF NOT EXISTS profiles (
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

-- Create flows table if it doesn't exist
CREATE TABLE IF NOT EXISTS flows (
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

-- Create executions table if it doesn't exist
CREATE TABLE IF NOT EXISTS executions (
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

-- Create credit_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    amount DECIMAL(10,4) NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('purchase', 'execution', 'refund', 'bonus')),
    reference_id UUID, -- execution_id, purchase_id, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
    -- Profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    -- Flows policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'flows' AND policyname = 'Public flows are viewable by all') THEN
        CREATE POLICY "Public flows are viewable by all" ON flows FOR SELECT USING (is_public = TRUE OR creator_id IS NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'flows' AND policyname = 'Users can view own flows') THEN
        CREATE POLICY "Users can view own flows" ON flows FOR SELECT USING (auth.uid() = creator_id);
    END IF;

    -- Executions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'executions' AND policyname = 'Users can view own executions') THEN
        CREATE POLICY "Users can view own executions" ON executions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'executions' AND policyname = 'Users can create own executions') THEN
        CREATE POLICY "Users can create own executions" ON executions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Credit transactions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credit_transactions' AND policyname = 'Users can view own transactions') THEN
        CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add the Text Analysis category
INSERT INTO categories (name, description, icon) 
VALUES ('Text Analysis', 'Text processing and analysis workflows', '📝')
ON CONFLICT (name) DO NOTHING;

-- Add the Loop Over Rows workflow (from https://github.com/federicodeponte/loop-over-rows.git)
INSERT INTO flows (
    id,
    name, 
    description,
    category_id,
    creator_id,
    inputs,
    outputs,
    runtime,
    is_public,
    is_featured
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Loop Over Rows - AI Batch Processing',
    'Scalable AI processing with Gemini 2.5-Flash. Transform any workflow into a highly scalable AI processing pipeline with row-keyed object structure and webhook delivery.',
    (SELECT id FROM categories WHERE name = 'Text Analysis'),
    NULL, -- system workflow
    '[
        {
            "name": "data",
            "label": "Input Data", 
            "type": "textarea",
            "required": true,
            "description": "Row-keyed data object. Example: {\"row1\": [\"enterprise chatbot\"], \"row2\": [\"AI assistant\"]}",
            "placeholder": "{\"row1\": [\"enterprise chatbot\"], \"row2\": [\"AI automation platform\"], \"row3\": [\"machine learning analytics\"]}"
        },
        {
            "name": "headers",
            "label": "Column Headers",
            "type": "text",
            "required": true,
            "description": "Comma-separated headers for your data columns",
            "placeholder": "Keyword",
            "default": "Keyword"
        },
        {
            "name": "prompt",
            "label": "Processing Prompt",
            "type": "textarea",
            "required": true,
            "description": "Tell the AI what to do with each row. Be specific about evaluation criteria.",
            "placeholder": "Evaluate each keyword for relevance to AI automation and enterprise market potential. Rate 0-100 and explain why."
        },
        {
            "name": "batch_size",
            "label": "Batch Size",
            "type": "number",
            "required": false,
            "default": 10,
            "min": 1,
            "max": 100,
            "description": "Number of rows to process concurrently (1-100)"
        }
    ]',
    '{
        "type": "object",
        "properties": {
            "data": {
                "type": "object",
                "description": "Row-keyed results with scores and rationales"
            },
            "headers": {
                "type": "array",
                "description": "Output column headers [Score, Rationale]"
            },
            "total_rows": {
                "type": "number",
                "description": "Total number of input rows"
            },
            "successful_rows": {
                "type": "number", 
                "description": "Successfully processed rows"
            },
            "failed_rows": {
                "type": "number",
                "description": "Failed processing rows"
            }
        }
    }',
    '{
        "endpoint": "https://federicodeponte--loop-over-rows-process-rows-batch.modal.run",
        "method": "POST",
        "timeout": 120000,
        "concurrent_containers": 100,
        "ai_model": "gemini-2.5-flash",
        "cost_per_row": 0.01
    }',
    true,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    inputs = EXCLUDED.inputs,
    outputs = EXCLUDED.outputs,
    runtime = EXCLUDED.runtime,
    is_public = EXCLUDED.is_public,
    is_featured = EXCLUDED.is_featured;

-- Also keep the simple keyword clustering for comparison
INSERT INTO flows (
    id,
    name, 
    description,
    category_id,
    creator_id,
    inputs,
    outputs,
    runtime,
    is_public,
    is_featured
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'Keyword Clustering (Simple)',
    'Group related keywords using semantic similarity analysis',
    (SELECT id FROM categories WHERE name = 'Text Analysis'),
    NULL, -- system workflow
    '[
        {
            "name": "keywords",
            "label": "Keywords",
            "type": "textarea",
            "required": true,
            "description": "Enter keywords separated by commas or new lines"
        },
        {
            "name": "num_clusters",
            "label": "Number of Clusters", 
            "type": "number",
            "required": true,
            "default": 5,
            "description": "How many groups should the keywords be organized into?"
        },
        {
            "name": "similarity_threshold",
            "label": "Similarity Threshold",
            "type": "number",
            "required": true,
            "default": 0.7,
            "min": 0.1,
            "max": 1.0,
            "step": 0.1,
            "description": "How similar should keywords be to group together?"
        }
    ]',
    '{
        "type": "object",
        "properties": {
            "clusters": {
                "type": "array",
                "description": "Grouped keywords by similarity"
            }
        }
    }',
    '{
        "endpoint": "https://your-modal-endpoint.modal.run/cluster-keywords",
        "method": "POST",
        "timeout": 60000
    }',
    true,
    false
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    inputs = EXCLUDED.inputs,
    outputs = EXCLUDED.outputs,
    runtime = EXCLUDED.runtime,
    is_public = EXCLUDED.is_public,
    is_featured = EXCLUDED.is_featured;

-- System workflows use NULL creator_id (no system user needed) 