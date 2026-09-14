"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import { PageHeader, ContentCard } from "../shared/list-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  gradient: string;
}

interface Message {
  id: number;
  conversationId: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

const CONVERSATIONS: Conversation[] = [
  { id: "c1", name: "Marco Rossi", role: "Bella Italia · Owner", lastMessage: "Sure, I'll send the menu update tonight.", time: "5m", unread: 2, online: true, gradient: "from-red-500 to-orange-600" },
  { id: "c2", name: "Yuki Tanaka", role: "Sushi Express · Manager", lastMessage: "The new POS integration works great!", time: "32m", unread: 0, online: true, gradient: "from-blue-500 to-cyan-600" },
  { id: "c3", name: "Raj Sharma", role: "Tandoori House · Owner", lastMessage: "When will the payout be processed?", time: "1h", unread: 1, online: false, gradient: "from-amber-500 to-orange-600" },
  { id: "c4", name: "Olivia Martin", role: "Customer", lastMessage: "Thank you for the quick refund!", time: "2h", unread: 0, online: false, gradient: "from-pink-500 to-rose-600" },
  { id: "c5", name: "Emma Garcia", role: "Pro Customer · Platinum", lastMessage: "Can I book a table for 8 PM?", time: "5h", unread: 0, online: true, gradient: "from-violet-500 to-purple-600" },
  { id: "c6", name: "Carlos Rivera", role: "Delivery Boy", lastMessage: "I'll be there in 5 minutes.", time: "1d", unread: 0, online: false, gradient: "from-emerald-500 to-teal-600" },
  { id: "c7", name: "Sarah Green", role: "Green Bowl · Owner", lastMessage: "We need more delivery riders in zone 3.", time: "2d", unread: 0, online: false, gradient: "from-green-500 to-emerald-600" },
];

const MESSAGES: Message[] = [
  { id: 1, conversationId: "c1", sender: "them", text: "Hi Alex! Hope you're doing well.", time: "10:24 AM" },
  { id: 2, conversationId: "c1", sender: "me", text: "Hi Marco! All good. How can I help you today?", time: "10:26 AM" },
  { id: 3, conversationId: "c1", sender: "them", text: "I wanted to update our menu — we're adding 3 new pasta dishes for the winter season. 🍝", time: "10:28 AM" },
  { id: 4, conversationId: "c1", sender: "me", text: "Awesome! You can do that directly from your restaurant dashboard under Menu → Dishes → Add New. Want me to walk you through it?", time: "10:30 AM" },
  { id: 5, conversationId: "c1", sender: "them", text: "Yes please, a quick walkthrough would be great.", time: "10:32 AM" },
  { id: 6, conversationId: "c1", sender: "me", text: "Perfect. I'll send you a screen recording. Meanwhile, can you share the dish names & prices?", time: "10:34 AM" },
  { id: 7, conversationId: "c1", sender: "them", text: "Sure, I'll send the menu update tonight.", time: "10:36 AM" },
];

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState("c1");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(MESSAGES);

  const filtered = CONVERSATIONS.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = CONVERSATIONS.find((c) => c.id === selectedId)!;
  const thread = messages.filter((m) => m.conversationId === selectedId);

  const send = () => {
    if (!draft.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      conversationId: selectedId,
      sender: "me",
      text: draft,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, newMsg]);
    setDraft("");
    toast.success("Message sent");
    // Auto-reply
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          conversationId: selectedId,
          sender: "them",
          text: "Thanks for the update! I'll get back to you shortly. 👍",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Chat with restaurant partners, customers & delivery boys"
      />

      <ContentCard className="overflow-hidden h-[640px]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversation list */}
          <div className={cn("border-r border-[#E5E7EB] flex flex-col", selectedId && "hidden md:flex")}>
            <div className="p-3 border-b border-[#E5E7EB]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-9 h-9 rounded-lg bg-[#F3F4F6] border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full text-left p-3 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors flex items-center gap-3",
                    selectedId === c.id && "bg-blue-50",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10 rounded-full">
                      <AvatarFallback className={cn("bg-gradient-to-br text-white text-xs rounded-full font-semibold", c.gradient)}>
                        {c.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#111827] truncate">{c.name}</p>
                      <span className="text-[10px] text-[#9CA3AF] shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-[#6B7280] truncate">{c.role}</p>
                    <p className="text-xs text-[#9CA3AF] truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-semibold inline-flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat thread */}
          <div className={cn("md:col-span-2 flex flex-col", !selectedId && "hidden md:flex")}>
            {/* Thread header */}
            <div className="p-3 border-b border-[#E5E7EB] flex items-center gap-3">
              <button onClick={() => setSelectedId("")} className="md:hidden w-8 h-8 rounded-lg hover:bg-[#F3F4F6] inline-flex items-center justify-center text-[#6B7280]">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <Avatar className="w-10 h-10 rounded-full">
                <AvatarFallback className={cn("bg-gradient-to-br text-white text-xs rounded-full font-semibold", selected.gradient)}>
                  {selected.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{selected.name}</p>
                <p className="text-xs text-emerald-600 inline-flex items-center gap-1">
                  {selected.online ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Online
                    </>
                  ) : (
                    <span className="text-[#9CA3AF]">{selected.role}</span>
                  )}
                </p>
              </div>
              <button className="w-9 h-9 rounded-lg hover:bg-[#F3F4F6] inline-flex items-center justify-center text-[#6B7280]" onClick={() => toast.info("Calling...")}>
                <Phone className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-lg hover:bg-[#F3F4F6] inline-flex items-center justify-center text-[#6B7280]" onClick={() => toast.info("Starting video call...")}>
                <Video className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-lg hover:bg-[#F3F4F6] inline-flex items-center justify-center text-[#6B7280]">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Thread messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 bg-[#F9FAFB]">
              {thread.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex items-end gap-2", m.sender === "me" && "flex-row-reverse")}
                >
                  <Avatar className="w-7 h-7 rounded-full shrink-0">
                    <AvatarFallback className={cn(
                      "text-white text-[10px] rounded-full font-semibold",
                      m.sender === "me" ? "bg-slate-600" : `bg-gradient-to-br ${selected.gradient}`,
                    )}>
                      {m.sender === "me" ? "AD" : selected.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "max-w-[70%] px-3.5 py-2 rounded-2xl text-sm",
                    m.sender === "me" ? "bg-primary text-white rounded-br-sm" : "bg-white text-[#111827] rounded-bl-sm border border-[#E5E7EB]",
                  )}>
                    {m.text}
                    <p className={cn("text-[10px] mt-1", m.sender === "me" ? "text-blue-100" : "text-[#9CA3AF]")}>{m.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Composer */}
            <div className="p-3 border-t border-[#E5E7EB] flex items-center gap-2">
              <button className="w-9 h-9 rounded-lg hover:bg-[#F3F4F6] inline-flex items-center justify-center text-[#6B7280]" onClick={() => toast.info("Attaching file...")}>
                <Paperclip className="w-4 h-4" />
              </button>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type a message..."
                className="flex-1 h-10 rounded-lg bg-[#F3F4F6] border-transparent"
              />
              <Button onClick={send} disabled={!draft.trim()} className="h-10 w-10 rounded-lg bg-primary hover:bg-blue-700 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
