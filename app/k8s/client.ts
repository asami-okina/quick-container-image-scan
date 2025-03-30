import * as k8s from "@kubernetes/client-node";
import type { V1Job, V1ConfigMap } from "@kubernetes/client-node";

// KubeConfigの初期化
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

// APIクライアントの作成
const k8sApi = {
  coreV1Api: kc.makeApiClient(k8s.CoreV1Api),
  batchV1Api: kc.makeApiClient(k8s.BatchV1Api),
};

/**
 * ConfigMapを読み込む
 */
export async function readNamespacedConfigMap(
  name: string,
  namespace: string
): Promise<V1ConfigMap> {
  try {
    const response = await k8sApi.coreV1Api.readNamespacedConfigMap(
      name,
      namespace
    );
    return response.body;
  } catch (err) {
    console.error("Error reading ConfigMap:", err);
    throw err;
  }
}

/**
 * 新しいJobを作成する
 */
export async function createJob(namespace: string, job: V1Job): Promise<V1Job> {
  try {
    const response = await k8sApi.batchV1Api.createNamespacedJob(
      namespace,
      job
    );
    return response.body;
  } catch (err) {
    console.error("Error creating job:", err);
    throw err;
  }
}
