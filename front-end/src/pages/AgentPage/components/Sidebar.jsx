import { MessageSquare, Moon, PanelLeftClose, Settings, SquarePen, Sun } from "lucide-react";
import OracleMark from "../../../components/ui/OracleMark";
import { motion } from "framer-motion";

export const CONVERSATIONS = [
  { id: "c1", title: "Explaining transformer attention", time: "20m ago" },
  { id: "c2", title: "Refactor the auth middleware", time: "5h ago" },
  { id: "c3", title: "Trip planning: Lisbon in October", time: "1d ago" },
];

export default function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeConvo,
  setActiveConvo,
  selectedModel,
  setMessages,
  theme,
  setTheme,
}) {
  const isDark = theme === "dark";

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 0 : 256, borderRightWidth: sidebarCollapsed ? 0 : 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute md:relative z-50 h-full overflow-hidden shrink-0 flex flex-col border-ora-border bg-ora-surface border-r"
    >
      <div className="w-[256px] flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-3.5">
          <div className="flex items-center gap-2 pl-1">
            <OracleMark size={20} />
            <span className="font-semibold text-[15px] tracking-[-0.01em]">ORACLE</span>
          </div>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="border-none bg-transparent text-ora-text-tertiary cursor-pointer p-1.5 rounded-md hover:bg-ora-raised transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="px-2">
          <button
            onClick={() => {
              setActiveConvo(null);
              setMessages([]);
            }}
            className="w-full flex items-center gap-2 border border-ora-border rounded-xl bg-transparent text-ora-text px-3 py-2 text-[14px] font-medium cursor-pointer hover:bg-ora-raised transition-colors"
          >
            <SquarePen size={15} /> New chat
          </button>
        </div>

        <div className="mt-5 flex-1 overflow-y-auto px-2">
          <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-ora-text-tertiary">
            Recent
          </p>
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveConvo(c.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 border-none rounded-lg text-[14px] text-left cursor-pointer transition-colors ${
                activeConvo === c.id
                  ? "bg-ora-raised text-ora-text"
                  : "bg-transparent text-ora-text-secondary hover:bg-ora-surface"
              }`}
            >
              <MessageSquare size={14} className="text-ora-text-tertiary shrink-0" />
              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{c.title}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-ora-border px-2 py-2.5">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-[12px] text-ora-text-tertiary">
              Model: <span className="text-ora-text-secondary">{selectedModel}</span>
            </span>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
              className="border-none bg-transparent text-ora-text-secondary cursor-pointer p-1.5 rounded-md hover:bg-ora-raised transition-colors"
            >
              {isDark ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
          <button className="w-full flex items-center gap-2 border-none bg-transparent text-ora-text-secondary px-2.5 py-2 rounded-lg text-[14px] cursor-pointer hover:bg-ora-surface transition-colors">
            <Settings size={15} /> Settings
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
