import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MODELS = [
  { name: "qwen2.5:7b", size: "7B" },
  { name: "qwen2.5:3b", size: "3B" },
  { name: "llama3.2", size: "3B" },
  { name: "mistral", size: "7B" },
  { name: "gemma3", size: "9B" },
];

export default function ModelSelector({ selectedModel, onSelect }) {
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border-none bg-transparent text-ora-text-secondary px-1.5 py-1 text-[13px] cursor-pointer"
      >
        <span className="font-medium text-ora-text">{selectedModel}</span>
        <ChevronDown
          size={13}
          className={`text-ora-text-tertiary transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[calc(100%+8px)] top-auto left-0 w-[260px] bg-ora-raised border border-ora-border rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.35)] overflow-hidden z-50"
          >
            <div className="flex items-center gap-2 border-b border-ora-border px-3 py-2.5">
              <Search size={14} className="text-ora-text-tertiary" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models…"
                className="border-none outline-none bg-transparent text-ora-text text-[14px] w-full"
              />
            </div>
            <div className="max-h-[260px] overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <div className="py-6 px-3 text-center text-[13px] text-ora-text-secondary">
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
                    className={`w-full flex items-center justify-between border-none rounded-lg px-2.5 py-2 cursor-pointer text-left hover:bg-ora-surface transition-colors ${
                      isSelected ? "bg-ora-surface" : "bg-transparent"
                    }`}
                  >
                    <span className="flex flex-col">
                      <span className="text-[14px] font-medium text-ora-text">{m.name}</span>
                      <span className="text-[12px] text-ora-text-tertiary">{m.size}</span>
                    </span>
                    {isSelected && <Check size={15} color="#c9a468" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
