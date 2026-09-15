"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft, MessageSquare } from "lucide-react";
import { PageHeader, ContentCard } from "../shared/list-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  senderId: string;
  senderType: string; // admin | vendor | customer | delivery_man
  receiverId: string;
  receiverType: string;
  lastMessageId: string | null;
  unreadMessageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string | null;
  senderId: string;
  message: string;
  file: string | null;
  isSeen: boolean;
  orderId: string | null;
  createdAt: string;
}

const FALLBACK_CONVERSATIONS: Conversation[] = [
  {
    id: "fb-1",
    senderId: "admin",
    senderType: "admin",
    receiverId: "v-101",
    receiverType: "vendor",
    lastMessageId: null,
    unreadMessageCount: 2,
    createdAt: "2025-11-21T10:00:00Z",
    updatedAt: "2025-11-21T10:36:00Z",
  },
  {
    id: "fb-2",
    senderId: "admin",
    senderType: "admin",
    receiverId: "u-204",
    receiverType: "customer",
    lastMessageId: null,
    unreadMessageCount: 0,
    createdAt: "2025-11-21T09:00:00Z",
    updatedAt: "2025-11-21T09:32:00Z",
  },
  {
    id: "fb-3",
    senderId: "admin",
    senderType: "admin",
    receiverId: "dm-12",
    receiverType: "delivery_man",
    lastMessageId: null,
    unreadMessageCount: 1,
    createdAt: "2025-11-20T18:00:00Z",
    updatedAt: "2025-11-20T18:42:00Z",
  },
  {
    id: "fb-4",
    senderId: "admin",
    senderType: "admin",
    receiverId: "v-105",
    receiverType: "vendor",
    lastMessageId: null,
    unreadMessageCount: 0,
    createdAt: "2025-11-19T15:00:00Z",
    updatedAt: "2025-11-19T15:20:00Z",
  },
];

const FALLBACK_MESSAGES: Record<string, Message[]> = {
  "fb-1": [
    {
      id: "fb-m1",
      conversationId: "fb-1",
      senderId: "v-101",
      message: "Hi Admin, I'd like to update my menu for winter season.",
      file: null,
      isSeen: true,
      orderId: null,
      createdAt: "2025-11-21T10:24:00Z",
    },
    {
      id: "fb-m2",
      conversationId: "fb-1",
      senderId: "admin",
      message: "Sure! You can do that under Dashboard → Menu → Dishes.",
      file: null,
      isSeen: true,
      orderId: null,
      createdAt: "2025-11-21T10:26:00Z",
    },
    {
      id: "fb-m3",
      conversationId: "fb-1",
      senderId: "v-101",
      message: "Thanks! I'll send the menu update tonight.",
      file: null,
      isSeen: false,
      orderId: null,
      createdAt: "2025-11-21T10:36:00Z",
    },
  ],
  "fb-2": [
    {
      id: "fb-m4",
      conversationId: "fb-2",
      senderId: "u-204",
      message: "Thank you for the quick refund!",
      file: null,
      isSeen: true,
      orderId: null,
      createdAt: "2025-11-21T09:32:00Z",
    },
  ],
};

const TYPE_GRADIENT: Record<string, string> = {
  vendor: "from-amber-500 to-orange-600",
  customer: "from-blue-500 to-cyan-600",
  delivery_man: "from-emerald-500 to-teal-600",
  admin: "from-violet-500 to-purple-600",
};

const TYPE_LABEL: Record<string, string> = {
  vendor: "Vendor",
  customer: "Customer",
  delivery_man: "Delivery",
  admin: "Admin",
};

function fmtTime(s: string) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function fmtRelative(s: string) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function displayName(c: Conversation): { name: string; gradient: string } {
  // Prefer the non-admin side as the visible interlocutor
  const isSenderAdmin = c.senderType === "admin";
  const otherType = isSenderAdmin ? c.receiverType : c.senderType;
  const otherId = isSenderAdmin ? c.receiverId : c.senderId;
  const typeKey = (otherType || "").toLowerCase();
  const gradient = TYPE_GRADIENT[typeKey] || "from-gray-500 to-gray-600";
  const label = TYPE_LABEL[typeKey] || "User";
  return { name: `${label} ${otherId}`, gradient };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(FALLBACK_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);

  // Fetch conversations on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/conversations", { cache: "no-store" });
        const json = await res.json();
        const arr: Conversation[] = Array.isArray(json) ? json : json.items ?? [];
        if (!cancelled) {
          setConversations(arr.length > 0 ? arr : FALLBACK_CONVERSATIONS);
          if (arr.length > 0 && !selectedId) setSelectedId(arr[0].id);
        }
      } catch {
        if (!cancelled) setConversations(FALLBACK_CONVERSATIONS);
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch messages when selectedId changes
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoadingThread(true);
    (async () => {
      try {
        const res = await fetch(`/api/messages?conversationId=${encodeURIComponent(selectedId)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        const arr: Message[] = Array.isArray(json) ? json : json.items ?? [];
        // API returns newest-first; reverse for chat display (oldest → newest)
        const ordered = [...arr].reverse();
        if (!cancelled) {
          setMessages((m) => ({ ...m, [selectedId]: ordered.length > 0 ? ordered : FALLBACK_MESSAGES[selectedId] || [] }));
        }
      } catch {
        if (!cancelled)
          setMessages((m) => ({ ...m, [selectedId]: FALLBACK_MESSAGES[selectedId] || [] }));
      } finally {
        if (!cancelled) setLoadingThread(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const filtered = conversations.filter((c) => {
    const { name } = displayName(c);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const selected = conversations.find((c) => c.id === selectedId) || null;
  const thread = selectedId ? messages[selectedId] || [] : [];

  const send = () => {
    if (!draft.trim()) return;
    // Optimistic local append
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      conversationId: selectedId,
      senderId: "admin",
      message: draft,
      file: null,
      isSeen: true,
      orderId: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => ({
      ...m,
      [selectedId]: [...(m[selectedId] || []), newMsg],
    }));
    setDraft("");
    // The /api/messages endpoint is GET/PATCH only (no POST yet). Show demo toast.
    toast.success("Message sent (demo)", {
      description: "POST /api/messages is not wired up yet — message displayed locally only.",
    });
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
          <div
            className={cn(
              "border-r border-border flex flex-col",
              selectedId && "hidden md:flex",
            )}
          >
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-9 h-9 rounded-lg bg-muted/40 border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loadingList ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No conversations yet.
                </div>
              ) : (
                filtered.map((c) => {
                  const { name, gradient } = displayName(c);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        "w-full text-left p-3 border-b border-border hover:bg-muted/30 transition-colors flex items-center gap-3",
                        selectedId === c.id && "bg-blue-50",
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-10 h-10 rounded-full">
                          <AvatarFallback
                            className={cn(
                              "bg-gradient-to-br text-white text-xs rounded-full font-semibold",
                              gradient,
                            )}
                          >
                            {initials(name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {fmtRelative(c.updatedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {TYPE_LABEL[(c.senderType || "").toLowerCase()] || "User"} ↔{" "}
                          {TYPE_LABEL[(c.receiverType || "").toLowerCase()] || "User"}
                        </p>
                      </div>
                      {c.unreadMessageCount > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-semibold inline-flex items-center justify-center">
                          {c.unreadMessageCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat thread */}
          <div
            className={cn(
              "md:col-span-2 flex flex-col",
              !selectedId && "hidden md:flex",
            )}
          >
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 mb-2 text-muted-foreground/40" />
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="p-3 border-b border-border flex items-center gap-3">
                  <button
                    onClick={() => setSelectedId("")}
                    className="md:hidden w-8 h-8 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <Avatar className="w-10 h-10 rounded-full">
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br text-white text-xs rounded-full font-semibold",
                        displayName(selected).gradient,
                      )}
                    >
                      {initials(displayName(selected).name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {displayName(selected).name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selected.senderType} → {selected.receiverType}
                    </p>
                  </div>
                  <button
                    className="w-9 h-9 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground"
                    onClick={() => toast.info("Calling...")}
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    className="w-9 h-9 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground"
                    onClick={() => toast.info("Starting video call...")}
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Thread messages */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 bg-muted/20">
                  {loadingThread ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className={cn(
                            "h-12 rounded-2xl",
                            i % 2 === 0 ? "w-3/4" : "w-2/3 ml-auto",
                          )}
                        />
                      ))}
                    </div>
                  ) : thread.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">
                      No messages yet. Start the conversation below.
                    </div>
                  ) : (
                    thread.map((m) => {
                      const mine = String(m.senderId) === "admin";
                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex items-end gap-2", mine && "flex-row-reverse")}
                        >
                          <Avatar className="w-7 h-7 rounded-full shrink-0">
                            <AvatarFallback
                              className={cn(
                                "text-white text-[10px] rounded-full font-semibold",
                                mine
                                  ? "bg-slate-600"
                                  : `bg-gradient-to-br ${displayName(selected).gradient}`,
                              )}
                            >
                              {mine ? "AD" : initials(displayName(selected).name)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "max-w-[70%] px-3.5 py-2 rounded-2xl text-sm break-words",
                              mine
                                ? "bg-primary text-white rounded-br-sm"
                                : "bg-background text-foreground rounded-bl-sm border border-border",
                            )}
                          >
                            {m.message}
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                mine ? "text-blue-100" : "text-muted-foreground",
                              )}
                            >
                              {fmtTime(m.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Composer */}
                <div className="p-3 border-t border-border flex items-center gap-2">
                  <button
                    className="w-9 h-9 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground"
                    onClick={() => toast.info("Attaching file...")}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 h-10 rounded-lg bg-muted/40 border-transparent"
                  />
                  <Button
                    onClick={send}
                    disabled={!draft.trim()}
                    className="h-10 w-10 rounded-lg bg-primary hover:bg-blue-700 shrink-0 px-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
