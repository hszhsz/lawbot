import { z } from "zod";

export const ProviderConfig = z.object({
  type: z.enum(["anthropic", "openai", "openai-compatible"]).default("anthropic"),
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  name: z.string().optional(),
});

export const ModelConfig = z.object({
  default: z.string().default("claude-sonnet-4-20250514"),
  thinking: z.string().optional(),
});

export const AgentConfig = z.object({
  maxSteps: z.number().min(1).max(20).default(10),
  temperature: z.number().min(0).max(2).default(0.7),
});

export const UIConfig = z.object({
  language: z.enum(["zh", "en"]).default("zh"),
  theme: z.enum(["dark", "light"]).default("dark"),
});

export const KnowledgeConfig = z.object({
  paths: z.array(z.string()).default([]),
});

export const AppConfig = z.object({
  provider: ProviderConfig.default({ type: "anthropic" }),
  model: ModelConfig.default({}),
  agent: AgentConfig.default({}),
  ui: UIConfig.default({}),
  knowledge: KnowledgeConfig.default({}),
});

export type Config = z.infer<typeof AppConfig>;
export type ProviderConfigType = z.infer<typeof ProviderConfig>;
