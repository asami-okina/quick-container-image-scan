import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";
import {
  createJob as k8sCreateJob,
  readNamespacedConfigMap,
} from "@/app/k8s/client";
import type { V1Job } from "@kubernetes/client-node";
import { parse } from "@ctrl/golang-template";

type Values = {
  instance: string;
  jobName: string;
  namespace: string;
  id: string;
  artifactName: string;
};

function jobName(jobId: string): string {
  return `job-${jobId}`;
}

function parseConfigMapDataBody({
  configMapDataBody,
  values,
}: {
  configMapDataBody: string;
  values: Values;
}): V1Job {
  const parsedBody = parse(configMapDataBody, values);

  return JSON.parse(parsedBody) as V1Job;
}

async function getConfigMapDataBody({
  namespace,
}: {
  namespace: string;
}): Promise<string> {
  const configMap = await readNamespacedConfigMap(
    "scan-job-template",
    namespace
  );
  if (!configMap.data || !configMap.data["body"]) {
    throw new Error(`ConfigMap 'scan-job-template' is missing or incomplete`);
  }
  if (typeof configMap.data["body"] !== "string") {
    throw new TypeError("ConfigMap data body is missing or not a string");
  }
  return configMap.data["body"];
}

async function createK8sJob({
  jobId,
  namespace,
  body,
}: {
  jobId: string;
  namespace: string;
  body: V1Job;
}): Promise<void> {
  try {
    logger.debug("Creating job: ", jobId);
    const res = await k8sCreateJob(namespace, body);
    logger.info("Job created: ", res.metadata?.name);
  } catch (error) {
    logger.error("Error while creating job: ", jobId);
    throw error;
  }
}

export async function createJob({
  id,
  artifactName,
}: {
  id: string;
  artifactName: string;
}): Promise<void> {
  logger.debug("Creating job with name:", artifactName);

  const namespace = "default";
  const jobId = uuidv4();
  const configMapDataBody = await getConfigMapDataBody({ namespace });
  const values: Values = {
    instance: uuidv4(),
    jobName: jobName(jobId),
    namespace,
    id,
    artifactName,
  };
  const body = parseConfigMapDataBody({
    configMapDataBody,
    values,
  });
  await createK8sJob({
    jobId,
    namespace,
    body,
  });
}
