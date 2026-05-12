import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import {
  extractReasoningMiddleware,
  wrapLanguageModel,
  type LanguageModelV1,
} from "ai";
import type { Config } from "../config/types.js";

// Models that use reasoning/thinking (e.g. DeepSeek R1, deepseek-v4-pro).
// Reasoning content must be extracted and re-passed to the API on subsequent tool-call steps.
const REASONING_MODELS = [
  "deepseek-v4-pro",
  "deepseek-reasoner",
  "deepseek-r1",
  "o1",
  "o3",
  "o4-mini",
];

function isReasoningModel(modelId: string): boolean {
  return REASONING_MODELS.some((m) => modelId.toLowerCase().includes(m.toLowerCase()));
}

export function getModel(config: Config): LanguageModelV1 {
  const { provider } = config;
  const modelId = config.model.default;

  switch (provider.type) {
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: provider.apiKey || process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(modelId);
    }
    case "openai": {
      const openai = createOpenAI({
        apiKey: provider.apiKey || process.env.OPENAI_API_KEY,
      });
      return openai(modelId);
    }
    case "openai-compatible": {
      const openai = createOpenAI({
        apiKey:
          provider.apiKey ||
          process.env.DEEPSEEK_API_KEY ||
          process.env.OPENAI_API_KEY ||
          "not-needed",
        baseURL: provider.baseURL || "http://localhost:11434/v1",
      });

      const baseModel = openai(modelId);

      // For reasoning models, wrap with extractReasoningMiddleware
      // so reasoning_content is properly handled across tool-call steps
      if (isReasoningModel(modelId)) {
        return wrapLanguageModel({
          model: baseModel,
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        });
      }

      return baseModel;
    }
    default:
      throw new Error(`Unknown provider type: ${(provider as { type: string }).type}`);
  }
}
