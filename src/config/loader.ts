import fs from "node:fs";
import yaml from "js-yaml";
import { getConfigPath } from "../utils/storage.js";
import { AppConfig, type Config } from "./types.js";
import { defaultConfig } from "./defaults.js";

export function loadConfig(modelOverride?: string): Config {
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

  // Resolve env vars for apiKey
  const config = result.data;
  if (config.provider.apiKey && config.provider.apiKey.startsWith("${") && config.provider.apiKey.endsWith("}")) {
    const envVar = config.provider.apiKey.slice(2, -1);
    config.provider.apiKey = process.env[envVar] ?? "";
  }

  return config;
}

export function createDefaultConfigFile(): string {
  const configPath = getConfigPath();
  const defaultYaml = `# Lawbot 配置文件 / Configuration
# 文档 / Docs: https://github.com/hszhsz/lawbot

provider:
  type: anthropic              # anthropic | openai | openai-compatible
  apiKey: \${ANTHROPIC_API_KEY} # 环境变量 / environment variable
  # baseURL: ""                # 兼容模式必填 / required for compatible

model:
  default: claude-sonnet-4-20250514
  # Other options: claude-opus-4-20250514, deepseek-chat, gpt-4o

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
