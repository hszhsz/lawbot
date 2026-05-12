import { tool } from "ai";
import { z } from "zod";
import { searchLaw } from "../knowledge/retriever.js";

export function createTools() {
  return {
    lawSearch: tool({
      description:
        "搜索中国法律法规数据库。输入关键词或法条编号，返回相关法条原文。用于需要查找具体法律条文依据的场景。Search Chinese laws and regulations by keyword or article number.",
      parameters: z.object({
        query: z
          .string()
          .describe("搜索关键词，如 '劳动合同解除 补偿金' 或 '民法典第1043条' / search query"),
        category: z
          .enum(["civil", "criminal", "administrative", "labor", "commercial"])
          .optional()
          .describe("法律分类 / legal category"),
      }),
      execute: async ({ query, category }) => {
        const results = await searchLaw(query, category);
        if (results.length === 0) {
          return "未找到相关法条。建议使用 webSearch 工具进行网络搜索。";
        }
        return results
          .map(
            (r) =>
              `【${r.source}】${r.title}\n${r.content}\n---`,
          )
          .join("\n");
      },
    }),

    webSearch: tool({
      description:
        "搜索网络上的法律信息。当内置知识库无法回答时使用。Search the web for legal information when the built-in knowledge base is insufficient.",
      parameters: z.object({
        query: z.string().describe("搜索查询 / search query"),
      }),
      execute: async ({ query }) => {
        // Placeholder - will implement real web search later
        return `网络搜索功能正在开发中。查询: ${query}\n建议：请参考中国法律法规数据库 (flk.npc.gov.cn) 或裁判文书网 (wenshu.court.gov.cn) 获取权威信息。`;
      },
    }),

    contractReview: tool({
      description:
        "审查合同文本中的风险条款，识别不公平条款、法律漏洞和潜在纠纷点。Review contract text for risky clauses, unfair terms, legal gaps, and potential dispute points.",
      parameters: z.object({
        contractText: z.string().describe("需要审查的合同文本 / contract text to review"),
        contractType: z
          .enum(["劳动合同", "租赁合同", "买卖合同", "借款合同", "保密协议", "其他"])
          .optional()
          .describe("合同类型 / contract type"),
      }),
      execute: async ({ contractText, contractType }) => {
        // Prompt-based review - the LLM will analyze the contract
        // This tool provides structured guidance
        const typeLabel = contractType ?? "其他";
        return `已接收${typeLabel}合同文本（${contractText.length}字符），正在进行风险审查分析...

审查要点：
1. 主体资格条款 - 核实签约方身份信息
2. 核心权利义务 - 对价、交付、验收标准
3. 违约责任 - 违约金比例是否合理（不超过实际损失30%）
4. 争议解决 - 管辖约定是否明确
5. 格式条款 - 是否存在《民法典》第497条规定的无效情形

请AI对此合同进行详细审查。`;
      },
    }),

    docDraft: tool({
      description:
        "根据提供的信息起草法律文书。Draft legal documents based on provided information.",
      parameters: z.object({
        docType: z
          .enum(["起诉状", "答辩状", "上诉状", "仲裁申请", "律师函", "协议", "遗嘱", "其他"])
          .describe("文书类型 / document type"),
        parties: z.string().describe("当事人信息 / party information"),
        facts: z.string().describe("事实描述 / factual description"),
        requirements: z.string().optional().describe("特殊要求 / special requirements"),
      }),
      execute: async ({ docType, parties, facts, requirements }) => {
        return `准备起草${docType}...\n\n当事人信息：${parties}\n事实概要：${facts}\n${requirements ? `特殊要求：${requirements}\n` : ""}\n请AI根据以上信息起草完整的${docType}。`;
      },
    }),
  };
}
