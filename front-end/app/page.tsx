"use client";
import React, { useState } from "react";
import { ArrowUp, Eye } from "@phosphor-icons/react";
import TextType from "@/components/TextType";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialMessages: {
  id: number;
  role: "user" | "assistant";
  text: string;
}[] = [];

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "assistant") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
        AI
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
      U
    </div>
  );
}

function MessageBubble({
  message,
}: {
  message: { id: number; role: "user" | "assistant"; text: string };
}) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex gap-3 my-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <Avatar role={message.role} />
      <div
        className={`flex max-w-[75%] flex-col ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-card text-card-foreground"
          }`}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: input.trim() },
    ]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex justify-center items-center gap-5 h-screen w-full flex-col bg-background text-foreground">
      {/* Message list */}
      {messages.length > 0 ? (
        <ScrollArea className="h-72 w-full rounded-md flex flex-1 flex-col gap-6 px-4 py-8">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </ScrollArea>
      ) : (
        <div className="flex items-center gap-4">
          <Eye size={50} className="text-accent" />
          <TextType
            className="text-5xl text-center"
            text={[
              "Good To See You!",
              "What do u think to do today?",
              "Let's have fun!",
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor
            cursorCharacter="_"
            deletingSpeed={50}
            cursorBlinkDuration={0.5}
          />
        </div>
      )}
      {/* Composer */}
      <div className="px-4 pb-6 pt-3 w-full">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-end gap-2 rounded-3xl border border-border bg-card px-4 py-3 shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message ORACLE..."
              className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="Send message"
            >
              <ArrowUp size={18} />
            </button>
          </div>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            ORACLE can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </main>
  );
}
