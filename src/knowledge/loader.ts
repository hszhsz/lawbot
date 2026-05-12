import { getKnowledgeDir } from "../utils/storage.js";
import { bundledLaws } from "./laws/index.js";
import fs from "node:fs";
import path from "node:path";

export interface LawArticle {
  source: string;
  title: string;
  content: string;
  category: string;
}

export function loadAllLaws(): LawArticle[] {
  const articles: LawArticle[] = [...bundledLaws];
  const userDir = getKnowledgeDir();

  // Load user-provided markdown files
  if (fs.existsSync(userDir)) {
    const files = fs.readdirSync(userDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(userDir, file), "utf-8");
        const parsed = parseLawMarkdown(file, content);
        articles.push(...parsed);
      } catch {
        // Skip unparseable files
      }
    }
  }

  return articles;
}

function parseLawMarkdown(
  filename: string,
  content: string,
): LawArticle[] {
  const articles: LawArticle[] = [];
  const sections = content.split(/(?=^#{1,3} )/m);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    if (lines.length === 0) continue;

    const title = lines[0].replace(/^#{1,3}\s*/, "").trim();
    const body = lines.slice(1).join("\n").trim();

    if (body) {
      articles.push({
        source: filename.replace(".md", ""),
        title,
        content: body,
        category: detectCategory(title, body),
      });
    }
  }

  return articles;
}

function detectCategory(title: string, content: string): string {
  const text = title + content;
  if (/劳动|劳动法|劳动合|工伤|社保|工资|加班/.test(text)) return "labor";
  if (/公司|企业|股东|股权|破产|票据|保险/.test(text)) return "commercial";
  if (/行政|行政法|处罚|复议|诉讼|许可/.test(text)) return "administrative";
  if (/刑事|犯罪|刑罚|故意|过失|盗窃|诈骗/.test(text)) return "criminal";
  return "civil";
}
