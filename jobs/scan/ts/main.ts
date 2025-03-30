import { spawn, SpawnOptions } from "child_process";
import { logger } from "./lib/logger.js";
import { prisma, PrismaClient } from "../../../prisma/prisma-client.js";
import { ScanResultsType, Vulnerability, License } from "./lib/type.js";

const { id, artifactName } = parseCommandLineArguments();

export async function main(): Promise<void> {
  logger.info(`Starting scan process - ID: ${id}, Image: ${artifactName}`);

  try {
    await prisma.$transaction(
      async (tx) => {
        await markScanAsScanning(tx);
        await logScanStart(tx);

        const { stdout } = await runTrivyScan(artifactName);
        const trivyResults = await parseTrivyResults(stdout, tx);

        await storeScanResults(tx, trivyResults);

        await markScanAsCompleted(tx);
        await tx.scanLog.create({
          data: {
            scanId: id,
            message: `Scan completed successfully: ${artifactName}`,
          },
        });
      },
      { maxWait: 600000, timeout: 600000 }
    );
  } catch (error) {
    await handleFailure(error);
    process.exit(1);
  }
}

async function markScanAsScanning(tx: TransactionClient) {
  await tx.scan.update({ where: { id }, data: { status: "SCANNING" } });
}

async function logScanStart(tx: TransactionClient) {
  await tx.scanLog.createMany({
    data: [
      { scanId: id, message: `Scan process started: ${artifactName}` },
      { scanId: id, message: `Starting Trivy scan execution` },
    ],
  });
}

async function runTrivyScan(image: string) {
  logger.info(`Running Trivy scan: ${image}`);
  return await spawnAsync(
    "trivy",
    ["image", "--scanners", "vuln,license", "--format", "json", image],
    { shell: false }
  );
}

async function parseTrivyResults(
  stdout: string,
  tx: TransactionClient
): Promise<ScanResultsType> {
  try {
    const results = JSON.parse(stdout);
    if (!results.Results) results.Results = [];
    return results;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("Failed to parse Trivy output:", msg);
    await tx.scanLog.create({
      data: { scanId: id, message: `Failed to parse Trivy output: ${msg}` },
    });
    throw err;
  }
}

async function storeScanResults(
  tx: TransactionClient,
  trivyResults: ScanResultsType
) {
  const results = trivyResults.Results || [];
  for (const result of results) {
    const scanResult = await tx.scanResult.create({
      data: {
        scanId: id,
        target: result.Target || "unknown",
        class: result.Class || "unknown",
        type: result.Type || "unknown",
      },
    });

    await createVulnerabilities(tx, scanResult.id, result.Vulnerabilities);
    await createLicenses(tx, scanResult.id, result.Licenses);
  }
}

async function createVulnerabilities(
  tx: TransactionClient,
  scanResultId: string,
  vulns?: Vulnerability[]
) {
  if (!Array.isArray(vulns)) return;
  for (const vuln of vulns) {
    await tx.vulnerability.create({
      data: {
        scanResultId,
        vulnerabilityId: vuln.VulnerabilityID || "unknown",
        pkgName: vuln.PkgName || "unknown",
        installedVersion: vuln.InstalledVersion || "unknown",
        fixedVersion: vuln.FixedVersion,
        status: vuln.Status || "unknown",
        primaryUrl: vuln.PrimaryURL,
        title: vuln.Title || "unknown",
        severity: vuln.Severity || "unknown",
        references: Array.isArray(vuln.References) ? vuln.References : [],
      },
    });
  }
}

async function createLicenses(
  tx: TransactionClient,
  scanResultId: string,
  licenses?: License[]
) {
  if (!Array.isArray(licenses)) return;
  for (const license of licenses) {
    await tx.license.create({
      data: {
        scanResultId,
        severity: license.Severity || "unknown",
        category: license.Category || "unknown",
        pkgName: license.PkgName || "unknown",
        name: license.Name || "unknown",
      },
    });
  }
}

async function markScanAsCompleted(tx: TransactionClient) {
  await tx.scan.update({ where: { id }, data: { status: "COMPLETED" } });
}

async function handleFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  logger.error("Unhandled error:", message);
  await prisma.scan.update({
    where: { id },
    data: { status: "FAILED", errorMessage: message },
  });
  const existing = await prisma.scanLog.findFirst({
    where: { scanId: id, message: `Unhandled error encountered: ${message}` },
  });
  if (!existing) {
    await prisma.scanLog.create({
      data: { scanId: id, message: `Unhandled error encountered: ${message}` },
    });
  }
}

function parseCommandLineArguments(): { id: string; artifactName: string } {
  const [id, artifactName] = process.argv.slice(2);
  if (!id || !artifactName)
    throw new Error("Missing required arguments: id and artifactName");
  return { id, artifactName };
}

function spawnAsync(
  command: string,
  args: string[],
  options: SpawnOptions = {}
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, options);
    let stdout = "",
      stderr = "";

    proc.stdout?.on("data", (data) => {
      const chunk = data.toString();
      stdout += chunk;
      logger.info(`[Trivy] ${chunk.trim()}`);
    });

    proc.stderr?.on("data", (data) => {
      const chunk = data.toString();
      stderr += chunk;
      logger.info(`[Trivy] ${chunk.trim()}`);
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        const isImageNotFoundError =
          stderr.includes("docker error: unable to inspect the image") ||
          stderr.includes("manifest unknown") ||
          stderr.includes("404 Not Found") ||
          stderr.includes("containerd socket not found") ||
          stderr.includes("no podman socket") ||
          stdout.includes("docker error: unable to inspect the image") ||
          stdout.includes("manifest unknown") ||
          stdout.includes("404 Not Found") ||
          stdout.includes("containerd socket not found") ||
          stdout.includes("no podman socket");

        if (isImageNotFoundError) {
          return reject(
            new Error(
              `Docker image not found or inaccessible: ${args[args.length - 1]}`
            )
          );
        }

        return reject(new Error(`Command failed with code ${code}`));
      }
      resolve({ stdout, stderr });
    });
  });
}

type TransactionClient = Omit<
  InstanceType<typeof PrismaClient>,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const signals = ["SIGHUP", "SIGINT", "SIGTERM"];
for (const sig of signals) {
  process.on(sig, () => {
    logger.info(`Received signal: ${sig}`);
    process.exit(0);
  });
}

main();
