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

  function formatOracleResponse(data) {
    if (!data) return "لا توجد تفاصيل متاحة للقرار.";

    const {
      final_decision,
      decision_reasoning,
      final_confidence = 0,
      climate_analysis,
      economy_analysis,
      health_analysis,
      citizen_perspective,
      ethics_evaluation,
    } = data;

    const confidencePercent = Math.round((final_confidence || 0) * 100);

    let reply = `### 🎯 القرار النهائي / Final Decision\n${final_decision || "تم اكتمال التحليل"}\n\n`;
    reply += `**📊 نسبة الثقة:** ${confidencePercent}%\n\n`;

    if (decision_reasoning) {
      reply += `### 📝 سبب القرار والتحليل المجمل\n${decision_reasoning}\n\n`;
    }

    reply += `---\n### 📋 تحليلات الوكلاء المتخصصين:\n`;

    if (climate_analysis) {
      reply += `\n**🌍 المناخ والبيئة (Climate Analysis):**\n${climate_analysis}\n`;
    }
    if (economy_analysis) {
      reply += `\n**💰 الاقتصاد والمالية (Economy Analysis):**\n${economy_analysis}\n`;
    }
    if (health_analysis) {
      reply += `\n**❤️ الصحة العامة (Health Analysis):**\n${health_analysis}\n`;
    }
    if (citizen_perspective) {
      reply += `\n**👥 رؤية المواطن (Citizen Perspective):**\n${citizen_perspective}\n`;
    }
    if (ethics_evaluation) {
      reply += `\n**⚖️ التقييم الأخلاقي (Ethics Evaluation):**\n${ethics_evaluation}\n`;
    }

    return reply;
  }

  async function handleSend(text) {
    const content = (text ?? draft).trim();
    if (!content || isLoading) return;

    const userMsg = { id: uid(), role: "user", content };
    const assistantMsg = { id: uid(), role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setDraft("");
    setIsLoading(true);

    try {
      const backendUrl =
        import.meta.env.VITE_API_URL ||
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? "http://localhost:5000/api/v1/decide"
          : "/api/v1/decide");
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_description: content,
          language: "Arabic"
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.status !== "success") {
        throw new Error(resData.message || resData.detail || "حدث خطأ أثناء التواصل مع محرك ORACLE");
      }

      const data = resData.data || {};
      const reply = formatOracleResponse(data);

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: reply, streaming: false } : m))
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: `❌ **عذراً، تعذر الاتصال بمحرك ORACLE AI:**\n${err.message}`,
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
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
