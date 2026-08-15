import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Mic,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Search,
  Settings,
  SquarePen,
  Sun,
  MessageSquare,
} from "lucide-react";

const MODELS = [
  { name: "qwen2.5:7b", size: "7B" },
  { name: "qwen2.5:3b", size: "3B" },
  { name: "llama3.2", size: "3B" },
  { name: "mistral", size: "7B" },
  { name: "gemma3", size: "9B" },
];

const CONVERSATIONS = [
  { id: "c1", title: "Explaining transformer attention", time: "20m ago" },
  { id: "c2", title: "Refactor the auth middleware", time: "5h ago" },
  { id: "c3", title: "Trip planning: Lisbon in October", time: "1d ago" },
];

const SUGGESTIONS = [
  { title: "Explain something", prompt: "Explain how DNS resolution works, step by step." },
  { title: "Write code", prompt: "Write a Python function that flattens a nested list." },
  { title: "Analyze a problem", prompt: "Help me think through migrating our API from REST to GraphQL." },
  { title: "Help me learn", prompt: "Teach me the basics of Bayesian statistics with a simple example." },
];

const MOCK_REPLIES = [
  "That's an interesting question. Here's how I'd think about it:\n\n1. Start with what you already know\n2. Break the problem into smaller pieces\n3. Test each piece before combining them\n\nWant me to go deeper on any of those steps?",
  "Here's a small example:\n\n```\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```\n\nLet me know if you'd like this adapted to a different language.",
  "Good question — there are a few ways to approach this:\n\n- Simplicity: pick the option with fewer moving parts\n- Performance: profile before optimizing\n- Maintainability: favor code your future self will understand\n\nWhich matters most for your situation?",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function OracleMark({ size = 20, pulsing = false, color = "#c9a468" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 8C10 8 5.5 12 4 16C5.5 20 10 24 16 24C22 24 26.5 20 28 16C26.5 12 22 8 16 8Z"
        stroke={color}
        strokeWidth="1.6"
      />
      <circle
        cx="16"
        cy="16"
        r="4.5"
        stroke={color}
        strokeWidth="1.6"
        style={pulsing ? { animation: "oracle-pulse 1.4s ease-in-out infinite" } : undefined}
      />
      <circle cx="16" cy="16" r="1.4" fill={color} />
    </svg>
  );
}

function Markdown({ text }) {
  const segments = text.split(/```([\s\S]*?)```/g);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {segments.map((seg, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            style={{
              margin: 0,
              overflowX: "auto",
              borderRadius: 10,
              border: "1px solid var(--ora-border)",
              background: "var(--ora-raised)",
              padding: "10px 12px",
              fontFamily: "ui-monospace, monospace",
              fontSize: 13,
              color: "var(--ora-text)",
            }}
          >
            <code>{seg.trim()}</code>
          </pre>
        ) : (
          seg.split("\n").map((line, j) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            const bullet = trimmed.match(/^-\s+(.*)/);
            const numbered = trimmed.match(/^\d+\.\s+(.*)/);
            if (bullet) {
              return (
                <div key={`${i}-${j}`} style={{ display: "flex", gap: 8, paddingLeft: 4, fontSize: 15, lineHeight: 1.6 }}>
                  <span style={{ color: "var(--ora-text-tertiary)" }}>•</span>
                  <span>{bullet[1]}</span>
                </div>
              );
            }
            if (numbered) {
              return (
                <div key={`${i}-${j}`} style={{ fontSize: 15, lineHeight: 1.6, paddingLeft: 4 }}>
                  {trimmed}
                </div>
              );
            }
            return (
              <p key={`${i}-${j}`} style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
                {trimmed}
              </p>
            );
          })
        )
      )}
    </div>
  );
}

function ModelSelector({ selectedModel, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(
    () => MODELS.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 8,
          border: "none",
          background: "transparent",
          color: "var(--ora-text-secondary)",
          padding: "4px 6px",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        <span style={{ fontWeight: 500, color: "var(--ora-text)" }}>{selectedModel}</span>
        <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", color: "var(--ora-text-tertiary)" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            top: "auto",
            left: 0,
            transform: "none",
            width: 260,
            background: "var(--ora-raised)",
            border: "1px solid var(--ora-border)",
            borderRadius: 12,
            boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
            overflow: "hidden",
            zIndex: 50,
            animation: "oracle-slide-up .15s cubic-bezier(.16,1,.3,1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--ora-border)", padding: "9px 12px" }}>
            <Search size={14} color="var(--ora-text-tertiary)" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search models…"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                color: "var(--ora-text)",
                fontSize: 14,
                width: "100%",
              }}
            />
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto", padding: 6 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "24px 12px", textAlign: "center", fontSize: 13, color: "var(--ora-text-secondary)" }}>
                No models match "{query}"
              </div>
            )}
            {filtered.map((m) => {
              const isSelected = m.name === selectedModel;
              return (
                <button
                  key={m.name}
                  onClick={() => {
                    onSelect(m.name);
                    setOpen(false);
                    setQuery("");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "none",
                    background: isSelected ? "var(--ora-surface)" : "transparent",
                    borderRadius: 8,
                    padding: "8px 10px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ora-surface)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? "var(--ora-surface)" : "transparent")}
                >
                  <span style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ora-text)" }}>{m.name}</span>
                    <span style={{ fontSize: 12, color: "var(--ora-text-tertiary)" }}>{m.size}</span>
                  </span>
                  {isSelected && <Check size={15} color="#c9a468" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OracleApp() {
  const [theme, setTheme] = useState("dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].name);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  const isDark = theme === "dark";

  const vars = isDark
    ? {
        "--ora-bg": "#0a0a0a",
        "--ora-surface": "#131313",
        "--ora-raised": "#1a1a1a",
        "--ora-border": "#262626",
        "--ora-text": "#f5f5f4",
        "--ora-text-secondary": "#a3a3a1",
        "--ora-text-tertiary": "#6b6b69",
      }
    : {
        "--ora-bg": "#fafaf9",
        "--ora-surface": "#ffffff",
        "--ora-raised": "#f4f4f3",
        "--ora-border": "#e7e5e3",
        "--ora-text": "#1c1c1a",
        "--ora-text-secondary": "#6b6b68",
        "--ora-text-tertiary": "#9a9a97",
      };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [draft]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function handleSend(text) {
    const content = (text ?? draft).trim();
    if (!content || isLoading) return;

    const userMsg = { id: uid(), role: "user", content };
    const assistantMsg = { id: uid(), role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setDraft("");
    setIsLoading(true);

    setTimeout(() => {
      const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
      setMessages((prev) => prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: reply, streaming: false } : m)));
      setIsLoading(false);
    }, 1100);
  }

  const isEmpty = messages.length === 0;

  return (
    <div
      style={{
        ...vars,
        display: "flex",
        height: "100vh",
        width: "100%",
        background: "var(--ora-bg)",
        color: "var(--ora-text)",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes oracle-pulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        @keyframes oracle-slide-down { from { opacity:0; transform: translateY(-6px) translateX(-50%) } to { opacity:1; transform: translateY(0) translateX(-50%) } }
        @keyframes oracle-slide-up { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: translateY(0) } }
        @keyframes oracle-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes oracle-spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        ::placeholder { color: var(--ora-text-tertiary); }
        textarea { font-family: inherit; }
      `}</style>

      {/* Sidebar */}
      <aside
        style={{
          width: sidebarCollapsed ? 0 : 256,
          overflow: "hidden",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: sidebarCollapsed ? "none" : "1px solid var(--ora-border)",
          background: "var(--ora-surface)",
          transition: "width .18s ease-out",
        }}
      >
        <div style={{ width: 256, display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4 }}>
              <OracleMark size={20} />
              <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>ORACLE</span>
            </div>
            <button
              onClick={() => setSidebarCollapsed(true)}
              style={{ border: "none", background: "transparent", color: "var(--ora-text-tertiary)", cursor: "pointer", padding: 6, borderRadius: 6 }}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          <div style={{ padding: "0 8px" }}>
            <button
              onClick={() => {
                setActiveConvo(null);
                setMessages([]);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--ora-border)",
                borderRadius: 10,
                background: "transparent",
                color: "var(--ora-text)",
                padding: "8px 12px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <SquarePen size={15} /> New chat
            </button>
          </div>

          <div style={{ marginTop: 20, flex: 1, overflowY: "auto", padding: "0 8px" }}>
            <p style={{ padding: "0 8px 6px", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ora-text-tertiary)" }}>
              Recent
            </p>
            {CONVERSATIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvo(c.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: 8,
                  background: activeConvo === c.id ? "var(--ora-raised)" : "transparent",
                  color: activeConvo === c.id ? "var(--ora-text)" : "var(--ora-text-secondary)",
                  fontSize: 14,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <MessageSquare size={14} color="var(--ora-text-tertiary)" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
              </button>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--ora-border)", padding: "10px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 8px" }}>
              <span style={{ fontSize: 12, color: "var(--ora-text-tertiary)" }}>
                Model: <span style={{ color: "var(--ora-text-secondary)" }}>{selectedModel}</span>
              </span>
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Toggle theme"
                style={{ border: "none", background: "transparent", color: "var(--ora-text-secondary)", cursor: "pointer", padding: 6, borderRadius: 6 }}
              >
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
            <button
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                background: "transparent",
                color: "var(--ora-text-secondary)",
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <Settings size={15} /> Settings
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: 56,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--ora-border)",
            padding: "0 12px",
            position: "relative",
          }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand sidebar"
                style={{ border: "none", background: "transparent", color: "var(--ora-text-secondary)", cursor: "pointer", padding: 6, borderRadius: 6 }}
              >
                <PanelLeft size={16} />
              </button>
            )}
          </div>
        </header>

        <main style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {isEmpty ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "0 16px",
                  animation: "oracle-fade .2s ease-out",
                }}
              >
                <OracleMark size={36} />
                <h1 style={{ marginTop: 16, marginBottom: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>ORACLE</h1>
                <p style={{ marginTop: 6, color: "var(--ora-text-secondary)", fontSize: 15 }}>How can I help you today?</p>
              </div>
            ) : (
              <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24 }}>
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ maxWidth: "75%", background: "var(--ora-raised)", borderRadius: 16, padding: "10px 16px", fontSize: 15, lineHeight: 1.6 }}>
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} style={{ display: "flex", gap: 12 }}>
                      <div style={{ marginTop: 2, flexShrink: 0 }}>
                        <OracleMark size={20} pulsing={m.streaming} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                        {m.streaming && !m.content ? (
                          <div style={{ display: "flex", gap: 4, padding: "6px 0" }}>
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: 999,
                                  background: "var(--ora-text-tertiary)",
                                  animation: `oracle-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <Markdown text={m.content} />
                        )}
                      </div>
                    </div>
                  )
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", padding: "8px 16px 16px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--ora-border)",
                borderRadius: 16,
                background: "var(--ora-surface)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message ORACLE…"
                rows={1}
                disabled={isLoading}
                style={{
                  resize: "none",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "var(--ora-text)",
                  fontSize: 15,
                  padding: "14px 16px 8px",
                  maxHeight: 200,
                }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px 10px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    aria-label="Voice input"
                    style={{ border: "none", background: "transparent", color: "var(--ora-text-tertiary)", cursor: "pointer", padding: 8, borderRadius: 8 }}
                  >
                    <Mic size={17} />
                  </button>
                  <button
                    onClick={() => handleSend()}
                    disabled={!draft.trim() || isLoading}
                    aria-label="Send message"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      border: "none",
                      cursor: draft.trim() && !isLoading ? "pointer" : "not-allowed",
                      background: draft.trim() && !isLoading ? "#c9a468" : "var(--ora-raised)",
                      color: draft.trim() && !isLoading ? "#141414" : "var(--ora-text-tertiary)",
                    }}
                  >
                    {isLoading ? (
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: "2px solid currentColor",
                          borderTopColor: "transparent",
                          animation: "oracle-spin .6s linear infinite",
                        }}
                      />
                    ) : (
                      <ArrowUp size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--ora-text-tertiary)", marginTop: 8 }}>
              ORACLE can make mistakes. Consider checking important information.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}


