import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { getConfigPath } from "../utils/storage.js";
import { AppConfig, type Config } from "./types.js";
import { defaultConfig } from "./defaults.js";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "../../");

function loadDotEnv(): Record<string, string> {
  const envFile = path.join(PROJECT_ROOT, ".env");
  if (!fs.existsSync(envFile)) return {};

  const vars: Record<string, string> = {};
  const content = fs.readFileSync(envFile, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
    // Inject into process.env so downstream code (providers, etc.) can read it
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  return vars;
}

function resolveEnvVars(value: string, envVars: Record<string, string>): string {
  return value.replace(/\$\{(\w+)\}/g, (_, name) => envVars[name] ?? process.env[name] ?? "");
}

function resolveConfigEnvVars(config: Config, envVars: Record<string, string>): void {
  if (config.provider.apiKey) {
    config.provider.apiKey = resolveEnvVars(config.provider.apiKey, envVars);
  }
  if (config.provider.baseURL) {
    config.provider.baseURL = resolveEnvVars(config.provider.baseURL, envVars);
  }
}

export function loadConfig(modelOverride?: string): Config {
  const envVars = loadDotEnv();
  const configPath = getConfigPath();

  let userConfig: Partial<Config> = {};
  if (fs.existsSync(configPath)) {
    const raw = yaml.load(fs.readFileSync(configPath, "utf-8"));
    userConfig = (raw as Record<string, unknown>) ?? {};
  }

  // Merge: defaults < user file < cli override
  const merged = {
    ...defaultConfig,
    ...userConfig,
    ...(modelOverride
      ? { model: { ...defaultConfig.model, ...userConfig.model, default: modelOverride } }
      : {}),
  };

  const result = AppConfig.safeParse(merged);
  if (!result.success) {
    throw new Error(
      `配置验证失败 / Config validation failed:\n${result.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`,
    );
  }

  const config = result.data;
  resolveConfigEnvVars(config, envVars);
  return config;
}

export function createDefaultConfigFile(): string {
  const configPath = getConfigPath();
  const defaultYaml = `# Lawbot 配置文件 / Configuration
# 文档 / Docs: https://github.com/hszhsz/lawbot

provider:
  type: openai-compatible              # anthropic | openai | openai-compatible
  apiKey: \${DEEPSEEK_API_KEY}          # 环境变量 / environment variable (支持 .env 文件)
  baseURL: https://api.deepseek.com/v1 # API 地址

model:
  default: deepseek-chat
  # Other options: claude-sonnet-4-20250514, gpt-4o, qwen-max
  # NOTE: 推理模型 (deepseek-reasoner/deepseek-v4-pro) 需要 SDK v5+ 才支持工具调用

agent:
  maxSteps: 10       # 最大工具调用步数
  temperature: 0.7

ui:
  language: zh        # zh | en
  theme: dark         # dark | light

knowledge:
  paths: []           # 额外知识库路径
`;

  fs.writeFileSync(configPath, defaultYaml, "utf-8");
  return configPath;
}
