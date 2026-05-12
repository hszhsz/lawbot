import { streamText, type CoreMessage, type ToolSet } from "ai";
import type { LanguageModelV1 } from "ai";
import type { Config } from "../config/types.js";
import { buildSystemPrompt } from "./system-prompt.js";
import { createTools } from "../tools/registry.js";

export interface AgentCallbacks {
  onToken?: (token: string) => void;
  onToolCall?: (toolName: string, status: "running" | "done" | "error", result?: string) => void;
  onFinish?: (usage: { promptTokens: number; completionTokens: number }) => void;
  onError?: (error: Error) => void;
}

export interface RunAgentParams {
  model: LanguageModelV1;
  config: Config;
  messages: CoreMessage[];
  callbacks: AgentCallbacks;
  abortSignal?: AbortSignal;
}

export async function runAgent({
  model,
  config,
  messages,
  callbacks,
  abortSignal,
}: RunAgentParams): Promise<string> {
  const { onToken, onToolCall, onFinish, onError } = callbacks;

  try {
    const systemPrompt = buildSystemPrompt(
      config.ui.language === "zh" ? "advisor" : "advisor",
    );

    const tools = createTools() as ToolSet;

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
      tools,
      maxSteps: config.agent.maxSteps,
      temperature: config.agent.temperature,
      abortSignal,
      onStepFinish: (event) => {
        // Report tool calls to UI
        const step = event as unknown as {
          toolCalls?: Array<{ toolName: string }>;
          toolResults?: Array<{ toolName: string; result: unknown }>;
        };
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (const tc of step.toolCalls) {
            onToolCall?.(tc.toolName, "running");
          }
        }
        if (step.toolResults && step.toolResults.length > 0) {
          for (const tr of step.toolResults) {
            const resultStr =
              typeof tr.result === "string"
                ? tr.result
                : JSON.stringify(tr.result);
            onToolCall?.(tr.toolName, "done", resultStr);
          }
        }
      },
      onFinish: (event) => {
        onFinish?.({
          promptTokens: event.usage.promptTokens,
          completionTokens: event.usage.completionTokens,
        });
      },
      onError: (error) => {
        onError?.(error instanceof Error ? error : new Error(String(error)));
      },
    });

    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
      onToken?.(chunk);
    }

    return fullText;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}
