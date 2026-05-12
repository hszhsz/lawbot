import type { Config } from "./types.js";

export const defaultConfig: Config = {
  provider: {
    type: "openai-compatible",
    apiKey: "${DEEPSEEK_API_KEY}",
    baseURL: "https://api.deepseek.com/v1",
  },
  model: {
    default: "deepseek-v4-pro",
  },
  agent: {
    maxSteps: 10,
    temperature: 0.7,
  },
  ui: {
    language: "zh",
    theme: "dark",
  },
  knowledge: {
    paths: [],
  },
};
