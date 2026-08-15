import { useState, useEffect } from "react";
import { PanelLeft } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";
import { MODELS } from "./components/ModelSelector";

const MOCK_REPLIES = [
  "That's an interesting question. Here's how I'd think about it:\n\n1. Start with what you already know\n2. Break the problem into smaller pieces\n3. Test each piece before combining them\n\nWant me to go deeper on any of those steps?",
  "Here's a small example:\n\n```\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```\n\nLet me know if you'd like this adapted to a different language.",
  "Good question — there are a few ways to approach this:\n\n- Simplicity: pick the option with fewer moving parts\n- Performance: profile before optimizing\n- Maintainability: favor code your future self will understand\n\nWhich matters most for your situation?",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AgentPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  
  // Persist theme choice and optionally apply to body if needed
  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].name);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: reply, streaming: false } : m))
      );
      setIsLoading(false);
    }, 1100);
  }

  return (
    <div className="flex h-screen w-full bg-ora-bg text-ora-text overflow-hidden relative">
      {/* Mobile backdrop */}
      {!sidebarCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeConvo={activeConvo}
        setActiveConvo={setActiveConvo}
        selectedModel={selectedModel}
        setMessages={setMessages}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 shrink-0 flex items-center border-b border-ora-border px-3 relative">
          <div className="flex-1 flex items-center">
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand sidebar"
                className="border-none bg-transparent text-ora-text-secondary cursor-pointer p-1.5 rounded-md hover:bg-ora-raised transition-colors"
              >
                <PanelLeft size={16} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 min-h-0 flex flex-col">
          <ChatArea messages={messages} />
          <ChatInput
            draft={draft}
            setDraft={setDraft}
            handleSend={handleSend}
            isLoading={isLoading}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </main>
      </div>
    </div>
  );
}
