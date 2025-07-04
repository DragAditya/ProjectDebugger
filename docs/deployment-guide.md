# Production Deployment Guide

This guide covers deploying Terminal++ in production environments with high availability, security, and scalability.

## 🎯 Deployment Options

### 1. Cloud Platforms
- **AWS EKS** - Recommended for enterprise
- **Google GKE** - Good for AI workloads
- **Azure AKS** - Enterprise integration
- **DigitalOcean** - Simple and cost-effective

### 2. Self-Hosted
- **Kubernetes** - Production-ready orchestration
- **Docker Swarm** - Simpler alternative
- **Single Node** - Development/testing

## 🚀 AWS EKS Deployment

### Prerequisites
```bash
# Install required tools
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Install Helm
curl https://get.helm.sh/helm-v3.13.0-linux-amd64.tar.gz | tar xz
sudo mv linux-amd64/helm /usr/local/bin/
```

### 1. Create EKS Cluster
```bash
# Create cluster configuration
cat > eks-cluster.yaml << EOF
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: terminalpp-cluster
  region: us-west-2
  version: "1.28"

availabilityZones: ["us-west-2a", "us-west-2b", "us-west-2c"]

managedNodeGroups:
  - name: worker-nodes
    instanceType: m5.large
    amiFamily: AmazonLinux2
    desiredCapacity: 3
    minSize: 1
    maxSize: 10
    volumeSize: 50
    ssh:
      allow: true
    labels: { role: worker }
    tags:
      nodegroup-role: worker

  - name: ai-nodes
    instanceType: g4dn.xlarge  # GPU instances for AI workloads
    amiFamily: AmazonLinux2
    desiredCapacity: 2
    minSize: 0
    maxSize: 5
    volumeSize: 100
    ssh:
      allow: true
    labels: { role: ai-worker }
    tags:
      nodegroup-role: ai-worker

addons:
  - name: vpc-cni
  - name: coredns
  - name: kube-proxy
  - name: aws-ebs-csi-driver

iam:
  withOIDC: true
  serviceAccounts:
    - metadata:
        name: aws-load-balancer-controller
        namespace: kube-system
      wellKnownPolicies:
        awsLoadBalancerController: true
    - metadata:
        name: cluster-autoscaler
        namespace: kube-system
      wellKnownPolicies:
        autoScaler: true

cloudWatch:
  clusterLogging:
    enableTypes: ["*"]
EOF

# Create the cluster
eksctl create cluster -f eks-cluster.yaml
```

### 2. Install Core Components
```bash
# Install AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update

kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master"

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=terminalpp-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Install Cluster Autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

kubectl -n kube-system annotate deployment.apps/cluster-autoscaler \
  cluster-autoscaler.kubernetes.io/safe-to-evict="false"

# Install NVIDIA Device Plugin (for GPU nodes)
kubectl create -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.14.0/nvidia-device-plugin.yml
```

### 3. Setup Storage
```bash
# Create storage classes
kubectl apply -f - << EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: slow-hdd
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: sc1
EOF
```

### 4. Deploy Terminal++
```bash
# Create namespace
kubectl create namespace terminalpp

# Apply secrets
kubectl create secret generic terminalpp-secrets \
  --from-literal=jwt-secret="$(openssl rand -base64 32)" \
  --from-literal=database-url="postgresql://username:password@rds-endpoint:5432/terminalpp" \
  --from-literal=redis-url="redis://elasticache-endpoint:6379" \
  --from-literal=openai-api-key="your-openai-key" \
  --from-literal=anthropic-api-key="your-anthropic-key" \
  --namespace terminalpp

# Deploy using Helm
helm repo add terminalpp https://charts.terminalpp.dev
helm repo update

helm install terminalpp terminalpp/terminalpp \
  --namespace terminalpp \
  --set global.domain=terminalpp.yourdomain.com \
  --set database.external.enabled=true \
  --set database.external.host=your-rds-endpoint \
  --set redis.external.enabled=true \
  --set redis.external.host=your-elasticache-endpoint \
  --set ingress.enabled=true \
  --set ingress.className=alb \
  --set ingress.annotations."alb\.ingress\.kubernetes\.io/scheme"=internet-facing \
  --set ingress.annotations."alb\.ingress\.kubernetes\.io/target-type"=ip \
  --set ingress.annotations."alb\.ingress\.kubernetes\.io/ssl-policy"=ELBSecurityPolicy-TLS-1-2-2017-01
```

## 🐳 Docker Swarm Deployment

### 1. Initialize Swarm
```bash
# On manager node
docker swarm init --advertise-addr YOUR_MANAGER_IP

# Join worker nodes
docker swarm join --token SWMTKN-1-... YOUR_MANAGER_IP:2377
```

### 2. Deploy Stack
```bash
# Create production docker-compose.prod.yml
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  web:
    image: terminalpp/web:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - terminalpp-network
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com

  api:
    image: terminalpp/api:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - terminalpp-network
    environment:
      - NODE_ENV=production
      - DATABASE_URL_FILE=/run/secrets/database_url
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
    secrets:
      - database_url
      - jwt_secret

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    deploy:
      placement:
        constraints: [node.role == manager]
    volumes:
      - nginx_config:/etc/nginx/conf.d
      - ssl_certs:/etc/ssl/certs
    networks:
      - terminalpp-network

networks:
  terminalpp-network:
    driver: overlay
    attachable: true

secrets:
  database_url:
    external: true
  jwt_secret:
    external: true

volumes:
  nginx_config:
  ssl_certs:
EOF

# Deploy the stack
docker stack deploy -c docker-compose.prod.yml terminalpp
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup with Let's Encrypt
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Firewall Configuration
```bash
# UFW setup
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow required ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 6443/tcp  # Kubernetes API (if applicable)

# Docker Swarm ports (if using)
sudo ufw allow 2377/tcp  # Cluster management
sudo ufw allow 7946     # Node communication
sudo ufw allow 4789/udp # Overlay network
```

### 3. Database Security
```bash
# PostgreSQL configuration
# Edit postgresql.conf
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
ssl_ca_file = '/etc/ssl/certs/ca.crt'

# Edit pg_hba.conf
hostssl all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 📊 Monitoring Setup

### 1. Prometheus & Grafana
```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Install Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=your-secure-password \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi

# Install custom Terminal++ dashboards
kubectl apply -f infrastructure/monitoring/dashboards/
```

### 2. Log Aggregation
```bash
# Install ELK Stack
helm repo add elastic https://helm.elastic.co
helm repo update

# Elasticsearch
helm install elasticsearch elastic/elasticsearch \
  --namespace monitoring \
  --set replicas=3 \
  --set volumeClaimTemplate.resources.requests.storage=30Gi

# Kibana
helm install kibana elastic/kibana \
  --namespace monitoring \
  --set service.type=LoadBalancer

# Filebeat
helm install filebeat elastic/filebeat \
  --namespace monitoring \
  --set daemonset.enabled=true
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push images
        run: |
          docker buildx build --platform linux/amd64,linux/arm64 \
            -t ghcr.io/your-org/terminalpp-web:${{ github.sha }} \
            -t ghcr.io/your-org/terminalpp-web:latest \
            --push apps/web
          
          docker buildx build --platform linux/amd64,linux/arm64 \
            -t ghcr.io/your-org/terminalpp-api:${{ github.sha }} \
            -t ghcr.io/your-org/terminalpp-api:latest \
            --push apps/api

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
      
      - name: Deploy to Kubernetes
        run: |
          helm upgrade terminalpp ./charts/terminalpp \
            --namespace terminalpp \
            --set image.tag=${{ github.sha }} \
            --wait --timeout 10m
```

### 2. Database Migrations
```bash
# Create migration job
cat > migration-job.yaml << EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-${{ github.sha }}
  namespace: terminalpp
spec:
  template:
    spec:
      containers:
      - name: migration
        image: ghcr.io/your-org/terminalpp-api:${{ github.sha }}
        command: ["npm", "run", "db:migrate"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: terminalpp-secrets
              key: database-url
      restartPolicy: Never
  backoffLimit: 3
EOF

kubectl apply -f migration-job.yaml
```

## 📈 Scaling Configuration

### 1. Horizontal Pod Autoscaler
```yaml
# Create HPA for web service
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: terminalpp-web-hpa
  namespace: terminalpp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: terminalpp-web
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. Vertical Pod Autoscaler
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: terminalpp-api-vpa
  namespace: terminalpp
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: terminalpp-api
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: api
      maxAllowed:
        cpu: 2
        memory: 4Gi
      minAllowed:
        cpu: 100m
        memory: 128Mi
```

## 🗄️ Database Management

### 1. RDS Setup (AWS)
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier terminalpp-prod \
  --db-instance-class db.r5.large \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password "$(openssl rand -base64 32)" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --backup-retention-period 30 \
  --deletion-protection \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name terminalpp-subnet-group \
  --multi-az

# Create read replica for scaling
aws rds create-db-instance-read-replica \
  --db-instance-identifier terminalpp-read-replica \
  --source-db-instance-identifier terminalpp-prod \
  --db-instance-class db.r5.large
```

### 2. Backup Strategy
```bash
# Create backup script
cat > backup-database.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="terminalpp_backup_$DATE.sql"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress and upload to S3
gzip $BACKUP_FILE
aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/database/

# Cleanup local files older than 7 days
find . -name "terminalpp_backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup-database.sh

# Schedule daily backups
echo "0 2 * * * /path/to/backup-database.sh" | crontab -
```

## 🔍 Health Checks & Monitoring

### 1. Application Health Checks
```yaml
# Add to deployment
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 2. External Monitoring
```bash
# Uptime monitoring with Pingdom/StatusPage
curl -X POST "https://api.pingdom.com/api/3.1/checks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Terminal++ Web",
    "type": "http",
    "host": "yourdomain.com",
    "url": "/",
    "encryption": true,
    "port": 443,
    "resolution": 1
  }'
```

## 🚨 Disaster Recovery

### 1. Backup Strategy
```bash
# Database backups
- Daily automated backups
- Point-in-time recovery enabled
- Cross-region backup replication
- 30-day retention policy

# Application data
- Container images in multiple registries
- Configuration stored in Git
- Secrets in encrypted storage
```

### 2. Recovery Procedures
```bash
# Database recovery
pg_restore --verbose --clean --no-acl --no-owner \
  -h new-db-host -U postgres -d terminalpp backup_file.dump

# Application recovery
kubectl apply -f infrastructure/k8s/
helm install terminalpp ./charts/terminalpp --namespace terminalpp
```

## 📋 Production Checklist

### Pre-Deployment
- [ ] SSL certificates configured
- [ ] Database backups tested
- [ ] Monitoring alerts configured
- [ ] Security scanning completed
- [ ] Load testing performed
- [ ] Disaster recovery plan documented

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring dashboards showing green
- [ ] Log aggregation working
- [ ] Backup procedures verified
- [ ] Performance baselines established
- [ ] Security alerts configured

### Ongoing Maintenance
- [ ] Security patches applied monthly
- [ ] Dependencies updated quarterly
- [ ] Backup restoration tested monthly
- [ ] Disaster recovery tested quarterly
- [ ] Performance reviewed monthly
- [ ] Cost optimization reviewed quarterly

## 🔧 Troubleshooting

### Common Issues
1. **High Memory Usage**: Increase resource limits or add more nodes
2. **Database Connection Pool Exhaustion**: Increase pool size or add read replicas
3. **Container Startup Failures**: Check resource constraints and health checks
4. **SSL Certificate Renewal**: Automate with cert-manager or similar

### Performance Optimization
- Enable HTTP/2 and compression
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries
- Use container image optimization

This deployment guide provides a comprehensive foundation for running Terminal++ in production with enterprise-grade reliability, security, and scalability.