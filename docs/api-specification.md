# API Specification

## Base Configuration
- **Base URL**: `https://api.terminalpp.dev/v1`
- **Authentication**: Bearer token (JWT)
- **Content-Type**: `application/json`
- **Rate Limiting**: 1000 requests/hour per user

## Authentication

### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "password"
}
```
**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe"
  },
  "token": "jwt_token",
  "expires_in": 86400
}
```

### POST /auth/register
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "secure_password",
  "full_name": "John Doe"
}
```

### POST /auth/logout
Invalidates current session token.

## Sandboxes

### GET /sandboxes
**Query Parameters:**
- `status`: Filter by status (running, stopped, etc.)
- `limit`: Number of results (default: 10, max: 100)
- `offset`: Pagination offset

**Response:**
```json
{
  "sandboxes": [
    {
      "id": "uuid",
      "name": "My Dev Environment",
      "description": "Node.js development sandbox",
      "status": "running",
      "image": "ubuntu:22.04",
      "resource_limits": {
        "cpu": "1",
        "memory": "2GB",
        "disk": "10GB"
      },
      "last_activity_at": "2024-01-01T10:00:00Z",
      "created_at": "2024-01-01T09:00:00Z"
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

### POST /sandboxes
```json
{
  "name": "My New Sandbox",
  "description": "Python development environment",
  "image": "python:3.11",
  "resource_limits": {
    "cpu": "2",
    "memory": "4GB",
    "disk": "20GB"
  },
  "environment_vars": {
    "NODE_ENV": "development",
    "API_URL": "https://api.example.com"
  },
  "exposed_ports": [3000, 8080]
}
```

### GET /sandboxes/:id
Get sandbox details including current status and metrics.

### PUT /sandboxes/:id
Update sandbox configuration.

### DELETE /sandboxes/:id
Delete sandbox and all associated data.

### POST /sandboxes/:id/start
Start a stopped sandbox.

### POST /sandboxes/:id/stop
Stop a running sandbox.

### POST /sandboxes/:id/restart
Restart a sandbox.

## Command Execution

### POST /sandboxes/:id/exec
```json
{
  "command": "ls -la",
  "working_directory": "/home/user",
  "environment_vars": {
    "DEBUG": "true"
  },
  "timeout": 30,
  "mode": "interactive" // or "background"
}
```

**Response:**
```json
{
  "execution_id": "uuid",
  "status": "running",
  "pid": 1234,
  "started_at": "2024-01-01T10:00:00Z"
}
```

### GET /sandboxes/:id/exec/:execution_id
Get command execution status and output.

**Response:**
```json
{
  "id": "uuid",
  "command": "ls -la",
  "status": "completed",
  "exit_code": 0,
  "stdout": "total 16\ndrwxr-xr-x 2 user user 4096 Jan  1 10:00 .\n...",
  "stderr": "",
  "execution_time_ms": 234,
  "started_at": "2024-01-01T10:00:00Z",
  "completed_at": "2024-01-01T10:00:01Z"
}
```

### DELETE /sandboxes/:id/exec/:execution_id
Kill a running command.

### GET /sandboxes/:id/exec
List command execution history.

## Filesystem

### GET /sandboxes/:id/files
```
Query Parameters:
- path: Directory path (default: "/")
- recursive: Include subdirectories (default: false)
- include_hidden: Include hidden files (default: false)
```

**Response:**
```json
{
  "entries": [
    {
      "name": "package.json",
      "path": "/home/user/package.json",
      "type": "file",
      "size_bytes": 1234,
      "mime_type": "application/json",
      "permissions": "644",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T11:00:00Z"
    },
    {
      "name": "src",
      "path": "/home/user/src",
      "type": "directory",
      "permissions": "755",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### GET /sandboxes/:id/files/content
```
Query Parameters:
- path: File path (required)
- version: Specific version number (optional)
```

**Response:** File content as text or binary.

### PUT /sandboxes/:id/files/content
```json
{
  "path": "/home/user/app.js",
  "content": "console.log('Hello World');",
  "encoding": "utf8", // or "base64"
  "create_directories": true
}
```

### POST /sandboxes/:id/files/upload
Multipart file upload.

### DELETE /sandboxes/:id/files
```json
{
  "path": "/home/user/temp.txt"
}
```

### POST /sandboxes/:id/files/move
```json
{
  "source": "/home/user/old.txt",
  "destination": "/home/user/new.txt"
}
```

### POST /sandboxes/:id/files/copy
```json
{
  "source": "/home/user/file.txt",
  "destination": "/home/user/backup.txt"
}
```

### GET /sandboxes/:id/files/versions
```
Query Parameters:
- path: File path (required)
```

**Response:**
```json
{
  "versions": [
    {
      "version_number": 3,
      "size_bytes": 1234,
      "change_type": "modified",
      "created_by": "user_id",
      "created_at": "2024-01-01T12:00:00Z",
      "commit_message": "Fixed bug in authentication"
    }
  ]
}
```

## AI System

### POST /ai/chat
```json
{
  "sandbox_id": "uuid",
  "message": "Help me debug this Node.js application",
  "model": "gpt-4", // optional, defaults to user preference
  "context": {
    "include_files": true,
    "include_recent_commands": true,
    "include_errors": true
  }
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "message_id": "uuid",
  "response": "I'll help you debug your Node.js application. Let me first examine your project structure...",
  "suggested_actions": [
    {
      "type": "command",
      "title": "Check package.json",
      "command": "cat package.json"
    },
    {
      "type": "file_edit",
      "title": "View main application file",
      "path": "/home/user/app.js"
    }
  ],
  "tokens_used": 150
}
```

### POST /ai/generate-command
```json
{
  "sandbox_id": "uuid",
  "goal": "Install Express.js and create a basic server",
  "context": {
    "current_directory": "/home/user/my-app",
    "installed_packages": ["node", "npm"]
  }
}
```

**Response:**
```json
{
  "commands": [
    {
      "command": "npm install express",
      "explanation": "Install Express.js framework",
      "safety_level": "safe",
      "estimated_time": "30s"
    },
    {
      "command": "touch server.js",
      "explanation": "Create main server file",
      "safety_level": "safe",
      "estimated_time": "1s"
    }
  ],
  "execution_plan": "First install Express.js dependency, then create the main server file",
  "warnings": []
}
```

### POST /ai/execute-auto
```json
{
  "sandbox_id": "uuid",
  "goal": "Set up a React development environment",
  "mode": "auto", // "auto", "review", "dry_run"
  "safety_checks": true
}
```

**Response:**
```json
{
  "execution_id": "uuid",
  "status": "running",
  "plan": {
    "steps": [
      {
        "step": 1,
        "action": "command",
        "command": "npx create-react-app my-app",
        "status": "pending"
      }
    ]
  }
}
```

### GET /ai/conversations/:id
Get conversation history and context.

### POST /ai/agents
```json
{
  "conversation_id": "uuid",
  "agent_type": "tester",
  "config": {
    "test_framework": "jest",
    "coverage_threshold": 80
  }
}
```

## GitHub Integration

### POST /github/connect
```json
{
  "code": "github_oauth_code"
}
```

### GET /github/repositories
List accessible repositories.

### POST /sandboxes/:id/github/clone
```json
{
  "repository_url": "https://github.com/user/repo.git",
  "branch": "main", // optional
  "directory": "/home/user/project" // optional
}
```

### POST /sandboxes/:id/github/push
```json
{
  "commit_message": "Update application logic",
  "branch": "feature/new-feature", // optional
  "create_branch": true // optional
}
```

### GET /sandboxes/:id/github/status
Get Git status and branch information.

## Snapshots

### GET /sandboxes/:id/snapshots
List snapshots for a sandbox.

### POST /sandboxes/:id/snapshots
```json
{
  "name": "Before major refactor",
  "description": "Stable state before restructuring codebase",
  "include_files": true,
  "include_database": false
}
```

### POST /sandboxes/:id/snapshots/:snapshot_id/restore
Restore sandbox to a previous snapshot.

### DELETE /sandboxes/:id/snapshots/:snapshot_id
Delete a snapshot.

## Collaboration

### POST /sandboxes/:id/collaborators
```json
{
  "email": "collaborator@example.com",
  "role": "editor", // "viewer", "editor"
  "expires_in": 86400 // optional, seconds
}
```

### GET /sandboxes/:id/collaborators
List sandbox collaborators.

### PUT /sandboxes/:id/collaborators/:user_id
Update collaborator permissions.

### DELETE /sandboxes/:id/collaborators/:user_id
Remove collaborator access.

## Secrets Management

### GET /sandboxes/:id/secrets
List secret names (not values).

### POST /sandboxes/:id/secrets
```json
{
  "name": "API_KEY",
  "value": "secret_value",
  "description": "Third-party API key",
  "type": "env_var",
  "expires_at": "2024-12-31T23:59:59Z" // optional
}
```

### PUT /sandboxes/:id/secrets/:name
Update secret value.

### DELETE /sandboxes/:id/secrets/:name
Delete secret.

## Plugins

### GET /plugins
List available plugins in marketplace.

### GET /plugins/:id
Get plugin details.

### POST /sandboxes/:id/plugins/:plugin_id/install
Install plugin in sandbox.

### DELETE /sandboxes/:id/plugins/:plugin_id
Uninstall plugin from sandbox.

### GET /sandboxes/:id/plugins
List installed plugins.

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.terminalpp.dev', {
  auth: { token: 'jwt_token' }
});
```

### Terminal Session
```javascript
// Join terminal session
socket.emit('terminal:join', { sandbox_id: 'uuid' });

// Send input
socket.emit('terminal:input', { data: 'ls -la\n' });

// Receive output
socket.on('terminal:output', (data) => {
  console.log(data.output);
});

// Resize terminal
socket.emit('terminal:resize', { cols: 80, rows: 24 });
```

### AI Streaming
```javascript
// Stream AI responses
socket.on('ai:message:chunk', (chunk) => {
  console.log(chunk.content);
});

socket.on('ai:message:complete', (message) => {
  console.log('Complete message:', message);
});
```

### Collaboration
```javascript
// Real-time file changes
socket.on('file:changed', (event) => {
  console.log(`File ${event.path} was ${event.action}`);
});

// Cursor positions
socket.emit('cursor:move', { file: 'app.js', line: 42, column: 10 });
socket.on('cursor:update', (cursors) => {
  // Update UI with collaborator cursors
});
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "Email format is invalid"
    },
    "request_id": "uuid"
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED` (401)
- `PERMISSION_DENIED` (403)
- `RESOURCE_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `SANDBOX_NOT_RUNNING` (409)
- `INSUFFICIENT_RESOURCES` (507)
- `INTERNAL_ERROR` (500)

## Rate Limiting Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641024000
```