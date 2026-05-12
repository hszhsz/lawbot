import chalk from "chalk";

export const theme = {
  primary: chalk.hex("#3B82F6"),       // Blue
  secondary: chalk.hex("#8B5CF6"),     // Purple
  success: chalk.hex("#10B981"),       // Green
  warning: chalk.hex("#F59E0B"),       // Amber
  error: chalk.hex("#EF4444"),         // Red
  dim: chalk.hex("#6B7280"),           // Gray
  bright: chalk.hex("#F9FAFB"),        // Near white
  highlight: chalk.hex("#FBBF24"),     // Gold
  legal: chalk.hex("#DC2626"),         // Deep red - legal accent

  user: chalk.hex("#3B82F6"),          // User message color
  assistant: chalk.hex("#D1D5DB"),     // Assistant message color
  toolCall: chalk.hex("#F59E0B"),      // Tool call color
  thinking: chalk.hex("#6B7280"),      // Thinking indicator color

  headerBg: "#1F2937",
  sidebarBg: "#111827",
  chatBg: "#0F172A",
  inputBg: "#1E293B",
  codeBg: "#1E293B",
  border: "#374151",
};

export const hotkeys = {
  quit: "Ctrl+C",
  newSession: "Ctrl+N",
  toggleSidebar: "Ctrl+S",
  clear: "Ctrl+L",
  historyUp: "Up",
  historyDown: "Down",
};
