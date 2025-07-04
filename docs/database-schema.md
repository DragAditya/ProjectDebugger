# Database Schema Design

## Overview
The Terminal++ system uses PostgreSQL as the primary database with Redis for caching and real-time data.

## Core Tables

### Users & Authentication
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    subscription_tier VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET
);
```

### Sandboxes & Containers
```sql
-- Sandboxes (user environments)
CREATE TABLE sandboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    container_id VARCHAR(255),
    image VARCHAR(255) DEFAULT 'ubuntu:22.04',
    status VARCHAR(20) DEFAULT 'stopped', -- stopped, starting, running, error
    resource_limits JSONB DEFAULT '{"cpu": "1", "memory": "1GB", "disk": "10GB"}',
    environment_vars JSONB DEFAULT '{}',
    exposed_ports JSONB DEFAULT '[]',
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    auto_sleep_after_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sandbox collaborators
CREATE TABLE sandbox_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'viewer', -- owner, editor, viewer
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(sandbox_id, user_id)
);
```

### Filesystem & Versioning
```sql
-- File system entries
CREATE TABLE fs_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- file, directory, symlink
    size_bytes BIGINT DEFAULT 0,
    mime_type VARCHAR(255),
    content_hash VARCHAR(64), -- SHA-256 of content
    permissions VARCHAR(10) DEFAULT '644',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(sandbox_id, path)
);

-- File versions/snapshots
CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fs_entry_id UUID REFERENCES fs_entries(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content_url TEXT, -- S3/storage URL
    content_preview TEXT, -- First 1000 chars for quick access
    size_bytes BIGINT NOT NULL,
    change_type VARCHAR(20), -- created, modified, deleted, renamed
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    commit_message TEXT
);

-- Snapshots (point-in-time sandbox state)
CREATE TABLE snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    snapshot_type VARCHAR(20) DEFAULT 'manual', -- manual, auto, scheduled
    file_count INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### AI System
```sql
-- AI conversations
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    title VARCHAR(255),
    model_used VARCHAR(50),
    total_tokens INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI messages
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- tokens, model info, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI agents
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- planner, coder, critic, tester, executor
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, paused, terminated
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI memory layers
CREATE TABLE ai_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    memory_type VARCHAR(20) NOT NULL, -- session, project, global
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    embedding VECTOR(1536), -- For semantic search
    importance_score FLOAT DEFAULT 0.5,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Command Execution & Logs
```sql
-- Command executions
CREATE TABLE command_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    command TEXT NOT NULL,
    working_directory VARCHAR(512) DEFAULT '/home/user',
    environment_vars JSONB DEFAULT '{}',
    execution_mode VARCHAR(20) DEFAULT 'manual', -- manual, auto, scheduled
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed, killed
    exit_code INTEGER,
    stdout TEXT,
    stderr TEXT,
    execution_time_ms INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### GitHub Integration
```sql
-- GitHub connections
CREATE TABLE github_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    github_user_id BIGINT NOT NULL,
    username VARCHAR(255) NOT NULL,
    access_token_hash VARCHAR(255) NOT NULL, -- Encrypted
    refresh_token_hash VARCHAR(255), -- Encrypted
    scope TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Repository links
CREATE TABLE repository_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    github_connection_id UUID REFERENCES github_connections(id) ON DELETE CASCADE,
    repository_full_name VARCHAR(255) NOT NULL, -- owner/repo
    clone_url TEXT NOT NULL,
    default_branch VARCHAR(255) DEFAULT 'main',
    current_branch VARCHAR(255),
    sync_status VARCHAR(20) DEFAULT 'synced', -- synced, pending, error
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Secrets Management
```sql
-- Encrypted secrets
CREATE TABLE secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    encrypted_value TEXT NOT NULL, -- Encrypted with user's key
    secret_type VARCHAR(50) DEFAULT 'env_var', -- env_var, api_key, ssh_key, certificate
    metadata JSONB DEFAULT '{}',
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sandbox_id, name)
);
```

### Plugins & Marketplace
```sql
-- Plugins
CREATE TABLE plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL,
    author_id UUID REFERENCES users(id),
    category VARCHAR(100),
    tags TEXT[],
    manifest JSONB NOT NULL, -- Plugin configuration
    download_url TEXT,
    install_count INTEGER DEFAULT 0,
    rating_average FLOAT DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User plugin installations
CREATE TABLE user_plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    config JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT true,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, plugin_id, sandbox_id)
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sandboxes_user_id ON sandboxes(user_id);
CREATE INDEX idx_sandboxes_status ON sandboxes(status);
CREATE INDEX idx_fs_entries_sandbox_path ON fs_entries(sandbox_id, path);
CREATE INDEX idx_command_executions_sandbox_user ON command_executions(sandbox_id, user_id);
CREATE INDEX idx_ai_conversations_user_sandbox ON ai_conversations(user_id, sandbox_id);
CREATE INDEX idx_ai_memory_embedding ON ai_memory USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_file_versions_fs_entry ON file_versions(fs_entry_id);
```

## Views

```sql
-- Active sandboxes view
CREATE VIEW active_sandboxes AS
SELECT 
    s.*,
    u.username,
    u.email,
    COUNT(ce.id) as command_count,
    MAX(ce.created_at) as last_command_at
FROM sandboxes s
JOIN users u ON s.user_id = u.id
LEFT JOIN command_executions ce ON s.id = ce.sandbox_id
WHERE s.status IN ('running', 'starting')
GROUP BY s.id, u.username, u.email;

-- User storage usage view
CREATE VIEW user_storage_usage AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(s.id) as sandbox_count,
    COALESCE(SUM(fs.total_size), 0) as total_storage_bytes
FROM users u
LEFT JOIN sandboxes s ON u.id = s.user_id
LEFT JOIN (
    SELECT 
        sandbox_id,
        SUM(size_bytes) as total_size
    FROM fs_entries 
    WHERE deleted_at IS NULL
    GROUP BY sandbox_id
) fs ON s.id = fs.sandbox_id
GROUP BY u.id, u.username;
```

## Redis Cache Schema

```
# Session data
user:session:{session_id} -> { user_id, sandbox_ids[], preferences }

# Real-time terminal sessions
terminal:session:{sandbox_id} -> { pid, cwd, env_vars }

# Command queue
queue:commands:{sandbox_id} -> [ { command, options, created_at } ]

# AI context cache
ai:context:{conversation_id} -> { messages[], agents[], memory[] }

# Rate limiting
rate_limit:user:{user_id}:{action} -> count (TTL: window)
rate_limit:ip:{ip_address}:{action} -> count (TTL: window)
```

## Data Retention Policies

```sql
-- Clean up old sessions
DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '7 days';

-- Archive old command executions
UPDATE command_executions 
SET archived = true 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Clean up expired AI memory
DELETE FROM ai_memory WHERE expires_at IS NOT NULL AND expires_at < NOW();

-- Remove old file versions (keep last 50 per file)
WITH ranked_versions AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY fs_entry_id ORDER BY created_at DESC) as rn
    FROM file_versions
)
DELETE FROM file_versions WHERE id IN (
    SELECT id FROM ranked_versions WHERE rn > 50
);
```