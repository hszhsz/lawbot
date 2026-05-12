import fs from "node:fs";
import path from "node:path";
import { ensureLawbotDir } from "./storage.js";

const LOG_FILE = path.join(ensureLawbotDir(), "debug.log");

export function log(...args: unknown[]): void {
  const msg = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${msg}\n`);
}

export function logError(error: unknown): void {
  const msg = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
  log("ERROR", msg);
}
