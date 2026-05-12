import os from "node:os";
import path from "node:path";
import fs from "node:fs";

const LAWBOT_DIR = path.join(os.homedir(), ".lawbot");

export function ensureLawbotDir(): string {
  if (!fs.existsSync(LAWBOT_DIR)) {
    fs.mkdirSync(LAWBOT_DIR, { recursive: true });
  }
  return LAWBOT_DIR;
}

export function getConfigPath(): string {
  return path.join(LAWBOT_DIR, "config.yaml");
}

export function getDbPath(): string {
  return path.join(LAWBOT_DIR, "sessions.db");
}

export function getKnowledgeDir(): string {
  const dir = path.join(LAWBOT_DIR, "knowledge");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getLawbotDir(): string {
  return LAWBOT_DIR;
}
