# 🚀 Deployment Guide - Triangulation App

Umfassender Guide für das Deployment der containerisierten Triangulation App in verschiedenen Umgebungen.

## 📋 Übersicht

| Deployment-Typ | Komplexität | Zeit | Empfohlen für |
|-----------------|-------------|------|---------------|
| [Docker Compose](#-docker-compose-lokal) | ⭐ Einfach | 5 min | Development, Testing |
| [Cloud Run](#️-google-cloud-run) | ⭐⭐ Mittel | 15 min | Schnelle Production |
| [AWS ECS](#-aws-ecs) | ⭐⭐⭐ Komplex | 30 min | Enterprise |
| [Kubernetes](#-kubernetes) | ⭐⭐⭐⭐ Sehr Komplex | 60+ min | Skalierbare Production |

## 🐳 Docker Compose (Lokal)

### Schnellstart
```bash
# Repository klonen
git clone https://github.com/username/triangulation-app-react.git
cd triangulation-app-react

# Environment Variables konfigurieren
cp .env.template .env
# Bearbeite .env nach Bedarf

# Produktion starten
docker-compose up -d

# App öffnen
open http://localhost:3000
```

### Konfiguration
```bash
# .env.production
REACT_APP_API_URL=/api
FLASK_ENV=production
SECRET_KEY=your_super_secret_production_key
POSTGRES_PASSWORD=your_secure_postgres_password
REDIS_PASSWORD=your_secure_redis_password
```

### Monitoring aktivieren
```bash
# Mit Prometheus und Grafana
docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# Dashboards:
# - App: http://localhost:3000
# - Grafana: http://localhost:3001 (admin/admin123)
# - Prometheus: http://localhost:9090
```

### SSL/HTTPS Setup
```bash
# 1. SSL Zertifikate generieren (für lokalen Test)
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/triangulation.key \
  -out ssl/triangulation.crt \
  -subj "/CN=triangulation.localhost"

# 2. Nginx SSL Konfiguration
cat > nginx-ssl.conf << 'EOF'
server {
    listen 443 ssl;
    server_name triangulation.localhost;
    
    ssl_certificate /etc/ssl/certs/triangulation.crt;
    ssl_certificate_key /etc/ssl/private/triangulation.key;
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# HTTP Redirect zu HTTPS
server {
    listen 80;
    server_name triangulation.localhost;
    return 301 https://$server_name$request_uri;
}
EOF

# 3. Docker Compose für SSL erweitern
# Siehe docker-compose.prod.yml für vollständige Konfiguration
```

## ☁️ Google Cloud Run

### Vorbereitung
```bash
# Google Cloud CLI installieren und authentifizieren
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Container Registry aktivieren
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Frontend deployen
```bash
# 1. Frontend Image bauen und pushen
cd frontend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/triangulation-frontend

# 2. Cloud Run Service erstellen
gcloud run deploy triangulation-frontend \
  --image gcr.io/YOUR_PROJECT_ID/triangulation-frontend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars REACT_APP_API_URL=https://YOUR_BACKEND_URL/api
```

### Backend deployen
```bash
# 1. Backend Image bauen und pushen
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/triangulation-backend

# 2. Cloud Run Service erstellen
gcloud run deploy triangulation-backend \
  --image gcr.io/YOUR_PROJECT_ID/triangulation-backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 5000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 20 \
  --set-env-vars FLASK_ENV=production \
  --set-env-vars SECRET_KEY=your_production_secret
```

### Custom Domain
```bash
# Domain Mapping erstellen
gcloud run domain-mappings create \
  --service triangulation-frontend \
  --domain triangulation.yourdomain.com \
  --region europe-west1

# DNS A-Record erstellen (zeigt auf die IP von gcloud run domain-mappings describe)
```

### Kosten-Optimierung
```yaml
# cloudbuild.yaml für optimierte Builds
steps:
  # Multi-stage builds mit caching
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/triangulation-frontend', 
           '--cache-from', 'gcr.io/$PROJECT_ID/triangulation-frontend:latest', 
           './frontend']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/triangulation-frontend']

# Automatisches Scaling konfigurieren
gcloud run services update triangulation-frontend \
  --concurrency 80 \
  --cpu-throttling \
  --execution-environment gen2
```

## 🏢 AWS ECS

### VPC und Infrastructure Setup
```bash
# AWS CLI konfigurieren
aws configure

# 1. ECS Cluster erstellen
aws ecs create-cluster --cluster-name triangulation-cluster

# 2. Task Definition für Frontend
cat > frontend-task-definition.json << 'EOF'
{
  "family": "triangulation-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "triangulation-frontend",
      "image": "YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/triangulation-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "REACT_APP_API_URL",
          "value": "https://api.triangulation.yourdomain.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/triangulation-frontend",
          "awslogs-region": "REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

# Task Definition registrieren
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json
```

### Service und Load Balancer
```bash
# 1. Application Load Balancer erstellen
aws elbv2 create-load-balancer \
  --name triangulation-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345

# 2. Target Group erstellen
aws elbv2 create-target-group \
  --name triangulation-frontend-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-12345 \
  --target-type ip \
  --health-check-path /health

# 3. ECS Service erstellen
aws ecs create-service \
  --cluster triangulation-cluster \
  --service-name triangulation-frontend-service \
  --task-definition triangulation-frontend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:REGION:ACCOUNT:targetgroup/triangulation-frontend-tg/12345,containerName=triangulation-frontend,containerPort=80
```

### ECR Setup für Container Images
```bash
# 1. ECR Repositories erstellen
aws ecr create-repository --repository-name triangulation-frontend
aws ecr create-repository --repository-name triangulation-backend

# 2. Docker Images bauen und pushen
$(aws ecr get-login --no-include-email --region REGION)

# Frontend
docker build -t triangulation-frontend ./frontend
docker tag triangulation-frontend:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/triangulation-frontend:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/triangulation-frontend:latest

# Backend
docker build -t triangulation-backend ./backend
docker tag triangulation-backend:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/triangulation-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/triangulation-backend:latest
```

## ⚓ Kubernetes

### Namespace und ConfigMap
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: triangulation

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: triangulation-config
  namespace: triangulation
data:
  REACT_APP_API_URL: "/api"
  FLASK_ENV: "production"
```

### Secrets
```bash
# Secrets erstellen
kubectl create secret generic triangulation-secrets \
  --from-literal=SECRET_KEY='your_super_secret_key' \
  --from-literal=POSTGRES_PASSWORD='your_postgres_password' \
  --from-literal=REDIS_PASSWORD='your_redis_password' \
  --namespace triangulation
```

### Deployments
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: triangulation-frontend
  namespace: triangulation
spec:
  replicas: 3
  selector:
    matchLabels:
      app: triangulation-frontend
  template:
    metadata:
      labels:
        app: triangulation-frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/username/triangulation-frontend:latest
        ports:
        - containerPort: 80
        envFrom:
        - configMapRef:
            name: triangulation-config
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10

---
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: triangulation-backend
  namespace: triangulation
spec:
  replicas: 2
  selector:
    matchLabels:
      app: triangulation-backend
  template:
    metadata:
      labels:
        app: triangulation-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/username/triangulation-backend:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: triangulation-config
        - secretRef:
            name: triangulation-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "400m"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 15
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Services und Ingress
```yaml
# k8s/services.yaml
apiVersion: v1
kind: Service
metadata:
  name: triangulation-frontend-service
  namespace: triangulation
spec:
  selector:
    app: triangulation-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: triangulation-backend-service
  namespace: triangulation
spec:
  selector:
    app: triangulation-backend
  ports:
  - port: 5000
    targetPort: 5000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: triangulation-ingress
  namespace: triangulation
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  tls:
  - hosts:
    - triangulation.yourdomain.com
    secretName: triangulation-tls
  rules:
  - host: triangulation.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: triangulation-backend-service
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: triangulation-frontend-service
            port:
              number: 80
```

### Deployment ausführen
```bash
# Alle Kubernetes Manifests anwenden
kubectl apply -f k8s/

# Status prüfen
kubectl get pods -n triangulation
kubectl get services -n triangulation
kubectl get ingress -n triangulation

# Logs anzeigen
kubectl logs -f deployment/triangulation-frontend -n triangulation
kubectl logs -f deployment/triangulation-backend -n triangulation
```

## 🌊 DigitalOcean App Platform

### App Spec Configuration
```yaml
# .do/app.yaml
name: triangulation-app
region: fra

services:
- name: frontend
  source_dir: /frontend
  github:
    repo: username/triangulation-app-react
    branch: main
    deploy_on_push: true
  build_command: npm run build
  run_command: npx serve -s build -l 3000
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  routes:
  - path: /
  env:
  - key: REACT_APP_API_URL
    value: ${backend.PUBLIC_URL}/api
    type: SECRET
  
- name: backend
  source_dir: /backend
  github:
    repo: username/triangulation-app-react
    branch: main
    deploy_on_push: true
  build_command: pip install -r requirements.txt
  run_command: python app.py
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 5000
  routes:
  - path: /api
  env:
  - key: FLASK_ENV
    value: production
  - key: SECRET_KEY
    value: your_production_secret_key
    type: SECRET

databases:
- name: triangulation-redis
  engine: REDIS
  production: false
  size: db-s-dev-database
```

### Deployment via CLI
```bash
# DigitalOcean CLI installieren
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.91.0/doctl-1.91.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authentifizieren
doctl auth init

# App erstellen
doctl apps create .do/app.yaml

# Status prüfen
doctl apps list
doctl apps get YOUR_APP_ID

# Logs anzeigen
doctl apps logs YOUR_APP_ID --type=BUILD
doctl apps logs YOUR_APP_ID --type=DEPLOY
```

## 📊 Monitoring & Logging

### Prometheus Setup
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'triangulation-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'triangulation-backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']
```

### Grafana Dashboards
```bash
# Dashboard automatisch importieren
mkdir -p monitoring/grafana/dashboards
curl -o monitoring/grafana/dashboards/triangulation-dashboard.json \
  https://grafana.com/api/dashboards/YOUR_DASHBOARD_ID/revisions/1/download
```

### ELK Stack für Logging
```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logging/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

## 🔒 Security Best Practices

### Container Security
```dockerfile
# Sicherheitshärtung im Dockerfile
FROM node:18-alpine as build
# ... build stage

FROM nginx:alpine
# Non-root user erstellen
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nginx -u 1001 -G nodejs

# Berechtigungen setzen
RUN chown -R nginx:nodejs /usr/share/nginx/html
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
```

### Environment Security
```bash
# Secrets mit Docker Secrets (Swarm Mode)
echo "your_secret_key" | docker secret create triangulation_secret_key -

# Oder mit Kubernetes Secrets
kubectl create secret generic triangulation-secrets \
  --from-literal=secret-key="your_secret_key" \
  --namespace triangulation
```

### Network Security
```yaml
# docker-compose.yml Network Isolation
networks:
  frontend:
    internal: false
  backend:
    internal: true
  database:
    internal: true

services:
  nginx:
    networks:
      - frontend
  
  frontend:
    networks:
      - frontend
      - backend
  
  backend:
    networks:
      - backend
      - database
  
  database:
    networks:
      - database
```

## 🔧 Troubleshooting

### Häufige Deployment-Probleme

#### Port-Konflikte
```bash
# Verwendete Ports prüfen
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Alternative Ports verwenden
docker-compose up -d --scale frontend=1 --scale backend=1 \
  -e FRONTEND_PORT=3001 -e BACKEND_PORT=5001
```

#### Memory-Probleme
```bash
# Docker Memory-Limits erhöhen
docker update --memory=2g --cpus=2 triangulation-frontend
docker update --memory=4g --cpus=2 triangulation-backend

# Kubernetes Resource-Limits anpassen
kubectl patch deployment triangulation-frontend -n triangulation -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","resources":{"limits":{"memory":"512Mi","cpu":"500m"}}}]}}}}'
```

#### SSL-Zertifikat Probleme
```bash
# Let's Encrypt Zertifikat erneuern
certbot renew --nginx

# Kubernetes cert-manager
kubectl get certificates -n triangulation
kubectl describe certificate triangulation-tls -n triangulation
```

#### Database Connection Issues
```bash
# Connection String prüfen
docker-compose exec backend python -c "
import os
print('DATABASE_URL:', os.getenv('DATABASE_URL'))
"

# Netzwerk-Konnektivität testen
docker-compose exec backend ping postgres
docker-compose exec backend nc -zv postgres 5432
```

### Performance Tuning

#### Docker Optimierung
```bash
# Multi-stage Build mit Cache Mount
docker build --target production \
  --cache-from triangulation-frontend:latest \
  -t triangulation-frontend:latest \
  ./frontend

# Docker Compose Performance
COMPOSE_HTTP_TIMEOUT=120 DOCKER_CLIENT_TIMEOUT=120 docker-compose up -d
```

#### Kubernetes Optimierung
```yaml
# HorizontalPodAutoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: triangulation-frontend-hpa
  namespace: triangulation
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: triangulation-frontend
  minReplicas: 2
  maxReplicas: 10
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

## 🔄 Backup & Recovery

### Database Backup
```bash
# PostgreSQL Backup
docker-compose exec postgres pg_dump -U triangulation triangulation > backup.sql

# Restore
docker-compose exec -T postgres psql -U triangulation triangulation < backup.sql

# Automatisiertes Backup Script
cat > backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database Backup
docker-compose exec postgres pg_dump -U triangulation triangulation | \
  gzip > $BACKUP_DIR/triangulation_db_$TIMESTAMP.sql.gz

# Application Data Backup
docker run --rm -v triangulation-data:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/triangulation_data_$TIMESTAMP.tar.gz /data

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x backup.sh
```

### Disaster Recovery
```bash
# Komplettes System Backup
docker-compose down
docker run --rm -v /var/lib/docker/volumes:/backup-source -v $(pwd)/full-backup:/backup \
  alpine tar czf /backup/docker-volumes-$(date +%Y%m%d).tar.gz /backup-source

# Recovery
docker-compose down -v
tar xzf docker-volumes-YYYYMMDD.tar.gz -C /var/lib/docker/volumes/
docker-compose up -d
```

---

## 📞 Support

Bei Problemen oder Fragen zum Deployment:

1. **Issues:** [GitHub Issues](https://github.com/username/triangulation-app-react/issues)
2. **Discussions:** [GitHub Discussions](https://github.com/username/triangulation-app-react/discussions)
3. **Email:** [your-email@domain.com](mailto:your-email@domain.com)

---

**Happy Deploying! 🚀**
