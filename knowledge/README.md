# 知识库扩展 / Knowledge Base Extension

将法律文本 Markdown 文件放入 `~/.lawbot/knowledge/` 目录，Lawbot 会自动加载并纳入检索范围。

Place legal text Markdown files in `~/.lawbot/knowledge/` — they will be automatically loaded for retrieval.

## 文件格式 / File Format

```markdown
# 法条标题 / Article Title
法条正文内容（可多段）
Article body (multiple paragraphs)

## 法条标题2
正文2
```

每个 `#` 或 `##` 标题会作为一个独立的检索条目。
Each `#` or `##` heading creates an independent searchable entry.

## 推荐来源 / Recommended Sources

- [国家法律法规数据库](https://flk.npc.gov.cn)
- [中国裁判文书网](https://wenshu.court.gov.cn)
- [北大法宝](https://www.pkulaw.com)
