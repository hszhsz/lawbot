import { program } from "commander";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "ink";
import React from "react";
import { App } from "./app.js";

const pkg = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../package.json"), "utf-8"),
);

program
  .name("lawbot")
  .description("专业中文法律 AI 智能体 - Professional Chinese Legal AI Agent")
  .version(pkg.version)
  .option("-m, --model <model>", "指定模型 / specify model")
  .option("-s, --session <id>", "恢复会话 / resume session")
  .option("--no-color", "禁用颜色 / disable color")
  .action(async (options) => {
    const { waitUntilExit } = render(
      React.createElement(App, {
        initialModel: options.model,
        initialSessionId: options.session,
      }),
    );
    await waitUntilExit();
  });

program.parse();
