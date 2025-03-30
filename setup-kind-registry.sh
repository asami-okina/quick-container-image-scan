#!/bin/sh
set -o errexit

# reference: https://kind.sigs.k8s.io/docs/user/local-registry/
# ==== Constants ====
REG_NAME='kind-registry'
REG_PORT='5001'
CLUSTER_NAME='kubecon-cluster'

# ==== Functions ====

start_registry() {
  if [ "$(docker inspect -f '{{.State.Running}}' "${REG_NAME}" 2>/dev/null || true)" != 'true' ]; then
    echo "Starting local registry container..."
    docker run -d --restart=always -p "${REG_PORT}:5000" --name "${REG_NAME}" registry:2
  else
    echo "Registry already running"
  fi
}

create_kind_cluster() {
  echo "Creating kind cluster..."
  cat <<EOF | kind create cluster --name "${CLUSTER_NAME}" --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry]
    config_path = "/etc/containerd/certs.d"
EOF
}

wait_for_kind_network() {
  for i in $(seq 1 10); do
    if docker network inspect kind >/dev/null 2>&1; then
      return
    fi
    echo "Waiting for kind network to be created... (${i}/10)"
    sleep 2
  done

  echo "Error: kind network not found"
  exit 1
}

connect_registry_to_network() {
  echo "Connecting registry to kind network..."
  docker network connect "kind" "${REG_NAME}" 2>/dev/null || true
}

setup_registry_config() {
  for node in $(kind get nodes --name "${CLUSTER_NAME}"); do
    for host in "localhost:${REG_PORT}" "${REG_NAME}:5000"; do
      REGISTRY_DIR="/etc/containerd/certs.d/${host}"
      echo "Configuring registry for node ${node} at ${host}..."
      docker exec "${node}" mkdir -p "${REGISTRY_DIR}"
      cat <<EOF | docker exec -i "${node}" cp /dev/stdin "${REGISTRY_DIR}/hosts.toml"
[host."http://${REG_NAME}:5000"]
EOF
    done
  done
}

apply_registry_configmap() {
  echo "Applying ConfigMap for local registry..."
  cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:${REG_PORT}"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF
}

restart_containerd_on_nodes() {
  echo "Restarting containerd on kind nodes..."
  for node in $(kind get nodes --name "${CLUSTER_NAME}"); do
    docker exec "${node}" systemctl restart containerd
  done
}

print_summary() {
  echo "✅ Setup complete!"
  echo "- From host: localhost:${REG_PORT}/myimage:tag"
  echo "- From within cluster: ${REG_NAME}:5000/myimage:tag"
}

# ==== Main Flow ====
start_registry
create_kind_cluster
wait_for_kind_network
connect_registry_to_network
setup_registry_config
apply_registry_configmap
restart_containerd_on_nodes
print_summary
