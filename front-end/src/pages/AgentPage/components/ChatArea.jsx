import { useEffect, useRef } from "react";
import OracleMark from "../../../components/ui/OracleMark";
import Markdown from "../../../components/ui/Markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatArea({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col items-center justify-center text-center px-4"
          >
            <OracleMark size={36} />
            <h1 className="mt-4 mb-0 text-2xl font-semibold tracking-[-0.01em]">ORACLE</h1>
            <p className="mt-1.5 text-[15px] text-ora-text-secondary">How can I help you today?</p>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[760px] mx-auto px-4 py-6 flex flex-col gap-6"
          >
            {messages.map((m) =>
              m.role === "user" ? (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[85%] md:max-w-[75%] bg-ora-raised rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed">
                    {m.content}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="mt-0.5 shrink-0">
                    <OracleMark size={20} pulsing={m.streaming} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    {m.streaming && !m.content ? (
                      <div className="flex gap-1 py-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ opacity: [0.35, 1, 0.35] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-ora-text-tertiary"
                          />
                        ))}
                      </div>
                    ) : (
                      <Markdown text={m.content} />
                    )}
                  </div>
                </motion.div>
              )
            )}
            <div ref={bottomRef} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
