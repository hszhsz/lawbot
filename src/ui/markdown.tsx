import React from "react";
import { Box, Text } from "ink";
import { marked, type Token, type Tokens } from "marked";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const tokens = marked.lexer(content);

  return (
    <Box flexDirection="column">
      {tokens.map((token, i) => (
        <RenderToken key={i} token={token} />
      ))}
    </Box>
  );
}

function RenderToken({ token }: { token: Token }) {
  switch (token.type) {
    case "heading":
      return <Heading token={token as Tokens.Heading} />;
    case "paragraph":
      return <Paragraph token={token as Tokens.Paragraph} />;
    case "text":
      return <InlineText text={token.text ?? ""} />;
    case "strong":
      return <Bold token={token as Tokens.Strong} />;
    case "em":
      return <Italic token={token as Tokens.Em} />;
    case "codespan":
      return <InlineCode token={token as Tokens.Codespan} />;
    case "code":
      return <CodeBlock token={token as Tokens.Code} />;
    case "list":
      return <List token={token as Tokens.List} />;
    case "list_item":
      return <ListItem token={token as Tokens.ListItem} />;
    case "blockquote":
      return <Blockquote token={token as Tokens.Blockquote} />;
    case "hr":
      return (
        <Box marginY={1}>
          <Text dimColor>────────────────────────────</Text>
        </Box>
      );
    case "space":
      return <Box height={1} />;
    default:
      if ("tokens" in token && Array.isArray(token.tokens)) {
        return (
          <Box flexDirection="column">
            {token.tokens.map((t: Token, i: number) => (
              <RenderToken key={i} token={t} />
            ))}
          </Box>
        );
      }
      if ("text" in token && token.text) {
        return <Text>{token.text}</Text>;
      }
      return null;
  }
}

function Heading({ token }: { token: Tokens.Heading }) {
  const sizeMap: Record<number, { bold: boolean; color?: string }> = {
    1: { bold: true },
    2: { bold: true },
    3: { bold: true },
    4: { bold: true },
    5: { bold: false },
    6: { bold: false },
  };
  const style = sizeMap[token.depth] ?? { bold: false };

  return (
    <Box marginY={token.depth <= 2 ? 1 : 0}>
      <Text bold={style.bold} underline={token.depth <= 2} color="#DC2626">
        {token.depth === 1 ? "— " : ""}
        {token.text}
      </Text>
    </Box>
  );
}

function Paragraph({ token }: { token: Tokens.Paragraph }) {
  return (
    <Box marginY={0}>
      {token.tokens?.map((t, i) => (
        <RenderToken key={i} token={t} />
      ))}
    </Box>
  );
}

function InlineText({ text }: { text: string }) {
  return <Text>{text}</Text>;
}

function Bold({ token }: { token: Tokens.Strong }) {
  return (
    <Text bold>
      {token.tokens?.map((t, i) => (
        <RenderToken key={i} token={t} />
      ))}
    </Text>
  );
}

function Italic({ token }: { token: Tokens.Em }) {
  return (
    <Text italic>
      {token.tokens?.map((t, i) => (
        <RenderToken key={i} token={t} />
      ))}
    </Text>
  );
}

function InlineCode({ token }: { token: Tokens.Codespan }) {
  return <Text backgroundColor="#1E293B">{token.text}</Text>;
}

function CodeBlock({ token }: { token: Tokens.Code }) {
  const lines = token.text.split("\n");
  return (
    <Box
      flexDirection="column"
      marginY={1}
      paddingX={1}
      paddingY={0}
    >
      <Box>
        <Text dimColor>
          {token.lang ? ` ${token.lang} ` : ""}
        </Text>
      </Box>
      {lines.map((line, i) => (
        <Box key={i}>
          <Text dimColor>{String(i + 1).padStart(3, " ")}│ </Text>
          <Text>{line || " "}</Text>
        </Box>
      ))}
    </Box>
  );
}

function List({ token }: { token: Tokens.List }) {
  return (
    <Box flexDirection="column" marginY={0}>
      {token.items.map((item, i) => (
        <Box key={i} marginY={0}>
          <Text dimColor>
            {token.ordered ? `${i + 1}. ` : "· "}
          </Text>
          <Box flexDirection="column">
            {item.tokens?.map((t, j) => (
              <RenderToken key={j} token={t} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function ListItem({ token }: { token: Tokens.ListItem }) {
  return (
    <Box flexDirection="column">
      {token.tokens?.map((t, i) => (
        <RenderToken key={i} token={t} />
      ))}
    </Box>
  );
}

function Blockquote({ token }: { token: Tokens.Blockquote }) {
  return (
    <Box marginY={0} paddingLeft={1}>
      <Box width={1}>
        <Text color="#DC2626">│</Text>
      </Box>
      <Box flexDirection="column" paddingLeft={1}>
        {token.tokens?.map((t, i) => (
          <RenderToken key={i} token={t} />
        ))}
      </Box>
    </Box>
  );
}
