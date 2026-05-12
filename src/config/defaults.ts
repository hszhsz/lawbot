import type { Config } from "./types.js";

export const defaultConfig: Config = {
  provider: {
    type: "anthropic",
  },
  model: {
    default: "claude-sonnet-4-20250514",
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
