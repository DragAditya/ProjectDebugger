# Terminal++ 🚀

**The Supreme Web Terminal - AI-First Development Environment**

A cloud-native, browser-based terminal with multi-agent AI orchestration, auto command execution, and persistent contextual memory. The future of development environments.

![Terminal++ Screenshot](docs/images/terminal-screenshot.png)

## ✨ Features

### 🤖 AI-Powered Development
- **Multi-Agent Orchestration**: Planner, Coder, Critic, Tester, and Executor agents
- **Auto Command Generation**: AI generates and executes commands safely
- **Contextual Memory**: Session, project, and global memory layers
- **Multi-Model Support**: OpenAI, Anthropic, Google Gemini, and local LLMs

### 🖥️ Modern Terminal Experience
- **Real-time Terminal**: Full Linux terminal in your browser
- **Multiple Shells**: Split panes, tabs, and parallel execution
- **Beautiful UI**: Modern, responsive design with themes
- **Mobile Support**: Works on phones, tablets, and desktops

### 🔒 Enterprise Security
- **Container Isolation**: Rootless containers with resource limits
- **Threat Detection**: AI-powered security analysis
- **Zero-Trust Architecture**: End-to-end encryption
- **Audit Logging**: Complete activity tracking

### 🌐 Collaboration
- **Real-time Sharing**: Pair programming in shared sandboxes
- **Version Control**: Advanced Git integration with AI
- **Snapshots**: Time-machine style rollbacks
- **Permissions**: Fine-grained access control

## � Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/your-org/terminal-plus-plus.git
cd terminal-plus-plus

# Copy environment template
cp .env.example .env

# Set your API keys in .env
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export GOOGLE_AI_API_KEY="your-google-key"
```

### 2. Start the Stack
```bash
# Start all services
docker-compose up -d

# Watch logs
docker-compose logs -f

# Health check
docker-compose ps
```

### 3. Access the Application
- **Web Interface**: http://localhost:3000
- **API Docs**: http://localhost:3001/docs
- **Grafana**: http://localhost:3030 (admin/grafana_dev_password)
- **Database**: http://localhost:5050 (pgAdmin)

### 4. Create Your First Sandbox
```bash
# Using the API
curl -X POST http://localhost:3001/api/v1/sandboxes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My First Sandbox",
    "image": "ubuntu:22.04",
    "resource_limits": {
      "cpu": "1",
      "memory": "2GB",
      "disk": "10GB"
    }
  }'
```

## � Project Structure

```
terminal-plus-plus/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── components/         # React components
│   │   ├── pages/             # Next.js pages
│   │   └── lib/               # Utilities and hooks
│   ├── api/                   # Express.js backend
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Authentication, etc.
│   │   └── services/          # Business logic
│   ├── container-runtime/     # Docker orchestration
│   └── ai-orchestrator/       # Multi-agent AI system
├── packages/
│   ├── shared/               # Shared types and utilities
│   ├── ai-core/             # LLM abstraction layer
│   └── security/            # Security utilities
├── infrastructure/
│   ├── docker/              # Container configurations
│   ├── k8s/                 # Kubernetes manifests
│   └── terraform/           # Infrastructure as code
├── docs/                    # Documentation
└── scripts/                 # Development scripts
```

## 🛠️ Development

### Local Development Setup
```bash
# Install dependencies
npm install

# Start development services
npm run dev:services

# Start all apps in development mode
npm run dev:all

# Run tests
npm run test

# Lint code
npm run lint
```

### Building Containers
```bash
# Build sandbox image
docker build -f infrastructure/docker/Dockerfile.sandbox -t terminalpp/sandbox .

# Build all app images
docker-compose build

# Push to registry
docker-compose push
```

### Database Management
```bash
# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Reset database
npm run db:reset

# Generate types
npm run db:generate-types
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/terminalpp
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-key
OLLAMA_URL=http://localhost:11434

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-encryption-key

# Container Runtime
DOCKER_HOST=unix:///var/run/docker.sock
MAX_CONTAINERS=100
SANDBOX_TIMEOUT=3600

# Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio_admin
S3_SECRET_KEY=minio_password
```

### Customizing AI Agents
```typescript
// apps/ai-orchestrator/config/agents.ts
export const AGENT_CONFIGS = {
  planner: {
    model: 'gpt-4',
    temperature: 0.3,
    max_tokens: 2000,
    system_prompt: 'You are an expert development planner...'
  },
  coder: {
    model: 'gpt-4',
    temperature: 0.1,
    max_tokens: 4000,
    system_prompt: 'You are an expert software engineer...'
  }
};
```

## 🚢 Deployment

### Production Docker Compose
```bash
# Use production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With SSL certificates
docker-compose -f docker-compose.yml -f docker-compose.ssl.yml up -d
```

### Kubernetes Deployment
```bash
# Apply all manifests
kubectl apply -f infrastructure/k8s/

# Check status
kubectl get pods -n terminalpp

# Port forward for testing
kubectl port-forward service/terminalpp-web 3000:3000 -n terminalpp
```

### Cloud Deployment (Terraform)
```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan deployment
terraform plan -var-file="production.tfvars"

# Apply
terraform apply -var-file="production.tfvars"
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Frontend tests
npm run test:web

# Backend tests
npm run test:api

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Load Testing
```bash
# Install k6
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1

# Run load tests
k6 run scripts/load-test.js
```

## 🔐 Security

### Security Features
- **Container Isolation**: Rootless containers with seccomp profiles
- **Network Security**: Isolated networks with firewall rules
- **Data Encryption**: At-rest and in-transit encryption
- **Threat Detection**: AI-powered security monitoring
- **Audit Logging**: Comprehensive activity tracking

### Security Checklist
- [ ] Change default passwords
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts

## 📊 Monitoring

### Available Dashboards
- **Grafana**: http://localhost:3030
  - System metrics
  - Application performance
  - User activity
  - Security events

- **Kibana**: http://localhost:5601
  - Log analysis
  - Error tracking
  - Search and visualization

### Key Metrics
- Container resource usage
- API response times
- Active user sessions
- AI agent performance
- Security incidents

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style
```bash
# Format code
npm run format

# Lint code
npm run lint:fix

# Type check
npm run type-check
```

### Pull Request Template
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Performance impact assessed

## 📖 API Documentation

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Sandboxes
```bash
# List sandboxes
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/v1/sandboxes

# Create sandbox
curl -X POST http://localhost:3001/api/v1/sandboxes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Sandbox", "image": "ubuntu:22.04"}'

# Execute command
curl -X POST http://localhost:3001/api/v1/sandboxes/SANDBOX_ID/exec \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la"}'
```

### AI Chat
```bash
# Chat with AI
curl -X POST http://localhost:3001/api/v1/ai/chat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sandbox_id": "SANDBOX_ID",
    "message": "Help me set up a React project"
  }'
```

## 🔧 Troubleshooting

### Common Issues

#### Containers not starting
```bash
# Check Docker status
docker system info

# Check logs
docker-compose logs container-name

# Restart services
docker-compose restart
```

#### Database connection issues
```bash
# Check database status
docker-compose exec postgres pg_isready

# Reset database
docker-compose down postgres
docker volume rm terminalpp_postgres_data
docker-compose up postgres
```

#### AI services not responding
```bash
# Check API keys
echo $OPENAI_API_KEY

# Test connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### Performance Optimization
- Increase container resource limits
- Use Redis clustering for high load
- Enable CDN for static assets
- Optimize database queries
- Use connection pooling

## 📝 Roadmap

### Phase 1: MVP (Completed)
- [x] Basic web terminal
- [x] Container orchestration
- [x] AI chat integration
- [x] User authentication

### Phase 2: AI Enhancement (In Progress)
- [x] Multi-agent system
- [x] Auto command execution
- [x] Contextual memory
- [ ] Advanced threat detection

### Phase 3: Collaboration (Planned)
- [ ] Real-time pair programming
- [ ] Team workspaces
- [ ] Advanced permissions
- [ ] Session recording

### Phase 4: Enterprise (Future)
- [ ] SSO integration
- [ ] Advanced analytics
- [ ] Custom plugins
- [ ] Offline mode

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Acknowledgments

- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [Docker](https://www.docker.com/) - Containerization
- [Next.js](https://nextjs.org/) - React framework
- [Socket.IO](https://socket.io/) - Real-time communication
- [OpenAI](https://openai.com/) - AI capabilities

## 📞 Support

- **Documentation**: [docs.terminalpp.dev](https://docs.terminalpp.dev)
- **Discord**: [Join our community](https://discord.gg/terminalpp)
- **Email**: support@terminalpp.dev
- **Issues**: [GitHub Issues](https://github.com/your-org/terminal-plus-plus/issues)

---

**Built with ❤️ by the Terminal++ Team**

*The future of development is here. Welcome to Terminal++.*
