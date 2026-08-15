import { useEffect, useRef } from "react";
import { ArrowUp, Mic } from "lucide-react";
import ModelSelector from "./ModelSelector";
import { motion } from "framer-motion";

export default function ChatInput({
  draft,
  setDraft,
  handleSend,
  isLoading,
  selectedModel,
  setSelectedModel,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [draft]);

  return (
    <div className="max-w-[760px] mx-auto w-full px-4 pb-4 pt-2">
      <div className="flex flex-col border border-ora-border rounded-2xl bg-ora-surface shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
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
          className="resize-none border-none outline-none bg-transparent text-ora-text text-[15px] px-4 pt-3.5 pb-2 max-h-[200px]"
        />
        <div className="flex items-center justify-between px-2.5 pb-2.5">
          <div className="flex items-center">
            <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label="Voice input"
              className="border-none bg-transparent text-ora-text-tertiary cursor-pointer p-2 rounded-lg hover:bg-ora-raised transition-colors"
            >
              <Mic size={17} />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!draft.trim() || isLoading}
              aria-label="Send message"
              className={`flex items-center justify-center w-8 h-8 rounded-lg border-none transition-colors ${
                draft.trim() && !isLoading
                  ? "bg-[#c9a468] text-[#141414] cursor-pointer hover:bg-[#d4b27c]"
                  : "bg-ora-raised text-ora-text-tertiary cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                  className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent block"
                />
              ) : (
                <ArrowUp size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-[12px] text-ora-text-tertiary mt-2">
        ORACLE can make mistakes. Consider checking important information.
      </p>
    </div>
  );
}
