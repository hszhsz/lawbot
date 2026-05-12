export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: string;
  createdAt: number;
}

// In-memory store for now, will migrate to SQLite in Phase 5
const sessions = new Map<string, Session>();
const messages = new Map<string, Message[]>();

export function createSession(title?: string): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    title: title || "新会话 / New Session",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  sessions.set(session.id, session);
  messages.set(session.id, []);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function listSessions(): Session[] {
  return Array.from(sessions.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}

export function updateSessionTitle(id: string, title: string): void {
  const session = sessions.get(id);
  if (session) {
    session.title = title;
    session.updatedAt = Date.now();
  }
}

export function deleteSession(id: string): void {
  sessions.delete(id);
  messages.delete(id);
}

export function addMessage(msg: Message): void {
  const msgs = messages.get(msg.sessionId) ?? [];
  msgs.push(msg);
  messages.set(msg.sessionId, msgs);
  const session = sessions.get(msg.sessionId);
  if (session) {
    session.updatedAt = Date.now();
    // Auto-title from first user message
    if (msg.role === "user" && session.title === "新会话 / New Session") {
      session.title = msg.content.slice(0, 40);
    }
  }
}

export function getMessages(sessionId: string): Message[] {
  return messages.get(sessionId) ?? [];
}
