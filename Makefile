.PHONY: create-cluster install-postgres setup-env setup-env-local clean all all-app-local build-job push-job build-and-push-job create-job-template create-postgresql-service create-app-service start-port-forward-app start-port-forward-postgres stop-port-forward-app stop-port-forward-postgres deploy-app build-app push-app build-and-push-app prisma-migrate-local local-dev apply-rbac

########################################
# Definition of Environment Variables
########################################
CLUSTER_NAME        := kubecon-cluster
LOCAL_REGISTRY      := localhost:5001
CLUSTER_REGISTRY    := kind-registry:5000
JOB_IMAGE           := $(LOCAL_REGISTRY)/scan:latest
CLUSTER_JOB_IMAGE   := $(CLUSTER_REGISTRY)/scan:latest
RELEASE_NAME        := my-release
POSTGRES_CHART      := oci://registry-1.docker.io/bitnamicharts/postgresql
NAMESPACE           := default

APP_IMAGE           := $(LOCAL_REGISTRY)/container-scan-app:latest
CLUSTER_APP_IMAGE   := $(CLUSTER_REGISTRY)/container-scan-app:latest

########################################
# Cluster/Registry Creation
########################################
create-cluster:
	chmod +x setup-kind-registry.sh
	./setup-kind-registry.sh
	@echo "Kind cluster and registry have been created"

########################################
# Image-Related Commands
########################################
build-job:
	docker build -t $(JOB_IMAGE) -f jobs/scan/Dockerfile .
	@echo "Job image has been built: $(JOB_IMAGE)"

push-job:
	docker push $(JOB_IMAGE)
	@echo "Job image has been pushed: $(JOB_IMAGE)"

build-and-push-job: build-job push-job

build-app:
	docker build -t $(APP_IMAGE) -f Dockerfile .
	@echo "Application image has been built: $(APP_IMAGE)"

push-app:
	docker push $(APP_IMAGE)
	@echo "Application image has been pushed: $(APP_IMAGE)"

build-and-push-app: build-app push-app

########################################
# PostgreSQL-Related Commands
########################################
install-postgres:
	helm install $(RELEASE_NAME) $(POSTGRES_CHART) --namespace $(NAMESPACE)
	@echo "PostgreSQL has been installed. Waiting for pod creation..."
	@until kubectl get pod -n $(NAMESPACE) $(RELEASE_NAME)-postgresql-0 2>/dev/null; do sleep 2; done
	@echo "PostgreSQL pod has been created. Waiting for Ready status..."
	@kubectl wait --namespace $(NAMESPACE) --for=condition=Ready --timeout=180s pod/$(RELEASE_NAME)-postgresql-0
	@echo "PostgreSQL setup has been completed"

########################################
# Environment Variable Setup
########################################
# For use on cluster (DATABASE_URL host is service name)
setup-env:
	@export POSTGRES_PASSWORD=$$(kubectl get secret --namespace $(NAMESPACE) $(RELEASE_NAME)-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d); \
	echo 'DATABASE_URL="postgresql://postgres:'$$POSTGRES_PASSWORD'@postgresql-service:5432/postgres?schema=public"' > .env; \
	echo 'DB_HOST="postgresql-service"' >> .env; \
	echo 'DB_PORT="5432"' >> .env; \
	echo ".env file has been created/updated in the root directory (for cluster connection)"

# For local development (host is localhost because port forwarding is used)
setup-env-local:
	@export POSTGRES_PASSWORD=$$(kubectl get secret --namespace $(NAMESPACE) $(RELEASE_NAME)-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d); \
	echo 'DATABASE_URL="postgresql://postgres:'$$POSTGRES_PASSWORD'@localhost:5432/postgres?schema=public"' > .env; \
	echo 'DB_HOST="localhost"' >> .env; \
	echo 'DB_PORT="5432"' >> .env; \
	echo ".env file has been updated (for local development)"

########################################
# Clean up
########################################
clean: stop-port-forward-app stop-port-forward-postgres
	-kind delete cluster --name $(CLUSTER_NAME)
	-docker stop kind-registry
	-docker rm kind-registry
	-docker network rm kind
	-rm -f .env
	@echo "Kind cluster and registry have been deleted, and .env file has been cleaned up"

########################################
# ConfigMap Creation
########################################
create-job-template:
	@echo "Installing job template..."
	sed -e 's|localhost:5001/scan:latest|$(CLUSTER_JOB_IMAGE)|g' \
	    k8s/scan-configmap.yaml > k8s/scan-configmap-modified.yaml
	kubectl apply -f k8s/scan-configmap-modified.yaml
	@echo "Job template ConfigMap has been created"
	@rm k8s/scan-configmap-modified.yaml

########################################
# Service Creation/RBAC
########################################
create-postgresql-service:
	@echo "Creating PostgreSQL NodePort service..."
	kubectl apply -f k8s/postgresql-service.yaml
	@echo "PostgreSQL NodePort service has been created"

create-app-service:
	@echo "Creating application service..."
	kubectl apply -f k8s/app-service.yaml
	@echo "Application service has been created"

apply-rbac:
	@echo "Applying RBAC settings..."
	kubectl apply -f k8s/rbac.yaml
	@echo "RBAC settings have been applied"

########################################
# Application Deployment
########################################
deploy-app: apply-rbac
	@echo "Deploying application..."
	kubectl apply -f k8s/app-deployment.yaml
	kubectl apply -f k8s/app-service.yaml
	@echo "Application has been deployed"

########################################
# Port Forwarding (Background Execution)
########################################
# For application
start-port-forward-app:
	@echo "Waiting for application pod to be ready..."
	@kubectl wait --namespace $(NAMESPACE) --for=condition=Ready --timeout=180s pod -l app.kubernetes.io/name=container-scan,app.kubernetes.io/component=app
	@echo "Starting port forwarding to application service in the background..."
	@kubectl port-forward svc/container-scan-app 8080:80 > /dev/null 2>&1 &
	@PID=$$(ps -ef | grep "kubectl port-forward svc/container-scan-app" | grep -v grep | awk '{print $$2}'); \
	echo "Port forwarding (app) process ID: $$PID"
	@echo "Application can be accessed at http://localhost:8080"

# For PostgreSQL
start-port-forward-postgres:
	@echo "Starting port forwarding to PostgreSQL service in the background..."
	@kubectl port-forward svc/postgresql-service 5432:5432 > /dev/null 2>&1 &
	@PID=$$(ps -ef | grep "kubectl port-forward svc/postgresql-service" | grep -v grep | awk '{print $$2}'); \
	echo "Port forwarding (PostgreSQL) process ID: $$PID"
	@echo "PostgreSQL can be connected at http://localhost:5432"

########################################
# Stop Port Forwarding
########################################
# For application
stop-port-forward-app:
	@echo "Stopping port forwarding for application..."
	@PID=$$(ps -ef | grep "kubectl port-forward svc/container-scan-app" | grep -v grep | awk '{print $$2}'); \
	if [ -n "$$PID" ]; then \
		kill $$PID; \
		echo "Port forwarding for application has been stopped (PID: $$PID)"; \
	else \
		echo "No running application port forwarding found"; \
	fi

# For PostgreSQL
stop-port-forward-postgres:
	@echo "Stopping port forwarding for PostgreSQL..."
	@PID=$$(ps -ef | grep "kubectl port-forward svc/postgresql-service" | grep -v grep | awk '{print $$2}'); \
	if [ -n "$$PID" ]; then \
		kill $$PID; \
		echo "Port forwarding for PostgreSQL has been stopped (PID: $$PID)"; \
	else \
		echo "No running PostgreSQL port forwarding found"; \
	fi

########################################
# Execute All Processes
########################################
# For deployment to cluster
all: create-cluster install-postgres create-postgresql-service create-app-service build-app push-app deploy-app build-job push-job create-job-template setup-env start-port-forward-app
	@echo "All setup has been completed!"
	@echo "Database connection string is saved in the .env file"
	@echo "Application can be accessed at http://localhost:8080"

# For local development (PostgreSQL connection via port forwarding)
all-app-local: create-cluster install-postgres create-postgresql-service build-job push-job create-job-template setup-env-local start-port-forward-postgres prisma-migrate-local
	@echo "Common components, PostgreSQL port forwarding, and Prisma Migrate have been completed."
	@echo "Please run 'pnpm run dev' next."

########################################
# Execute Prisma Migrate (For Local)
########################################
prisma-migrate-local:
	@echo "Executing Prisma Migrate locally..."
	@pnpm prisma migrate deploy

########################################
# Execute pnpm run dev Locally (Optional)
########################################
local-dev:
	@echo "Starting pnpm run dev locally..."
	@pnpm run dev
