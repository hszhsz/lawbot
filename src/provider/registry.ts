import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";
import type { Config } from "../config/types.js";

export function getModel(config: Config): LanguageModelV1 {
  const { provider } = config;

  switch (provider.type) {
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: provider.apiKey || process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(config.model.default);
    }
    case "openai": {
      const openai = createOpenAI({
        apiKey: provider.apiKey || process.env.OPENAI_API_KEY,
      });
      return openai(config.model.default);
    }
    case "openai-compatible": {
      // For DeepSeek, Qwen, Ollama, etc.
      const openai = createOpenAI({
        apiKey: provider.apiKey || process.env.OPENAI_API_KEY || "not-needed",
        baseURL: provider.baseURL || "http://localhost:11434/v1",
      });
      return openai(config.model.default);
    }
    default:
      throw new Error(`Unknown provider type: ${(provider as { type: string }).type}`);
  }
}
