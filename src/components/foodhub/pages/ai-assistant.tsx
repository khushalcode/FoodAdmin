"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { PageHeader, ContentCard } from "../shared/list-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Msg {
  id: number;
  role: "user" | "ai";
  text: string;
  ts: string;
}

const SUGGESTED = [
  "What's our top-selling dish today?",
  "Show me yesterday's revenue breakdown",
  "Which restaurants have low ratings?",
  "Forecast next week's orders",
  "Compare this month vs last month",
  "Find unusual spikes in cancellations",
];

const SAMPLE_REPLIES: Record<string, string> = {
  "What's our top-selling dish today?":
    "Today's top performer is Margherita Pizza with 248 orders ($3,220 in revenue). It's up 12.4% vs yesterday. 🍕",
  "Show me yesterday's revenue breakdown":
    "Yesterday's total revenue was $4,820.43 across 184 orders:\n• Pizza: $1,832 (38%)\n• Burgers: $1,156 (24%)\n• Sushi: $723 (15%)\n• Salads: $482 (10%)\n• Other: $627 (13%)",
  "Which restaurants have low ratings?":
    "Three restaurants have ratings below 4.0:\n1. Street Tacos — 3.7 ★ (24 reviews)\n2. Quick Bites — 3.8 ★ (18 reviews)\n3. Corner Cafe — 3.9 ★ (42 reviews)\n\nWant me to draft improvement suggestions?",
  "Forecast next week's orders":
    "Based on the last 4 weeks' trend, I forecast 2,180 orders next week (+7.2%). Friday's expected 420-order spike may require additional delivery staff. 📈",
  "Compare this month vs last month":
    "November 2025 vs October 2025:\n• Revenue: $98,240 vs $82,410 (+19.2%)\n• Orders: 1,842 vs 1,594 (+15.6%)\n• Avg order value: $53.33 vs $51.70 (+3.2%)\n• New customers: 412 vs 358 (+15.1%)",
  "Find unusual spikes in cancellations":
    "⚠️ I detected an unusual cancellation spike on Nov 12 (24 cancellations vs avg of 8/day). Most were from Burger Bros between 7–9 PM — possibly due to a kitchen staffing issue.",
};

function genericReply(input: string): string {
  return `Great question! Based on your current data, I'd analyze "${input}" against the last 30 days of FoodHub activity. Here's a quick summary:\n\n• Total revenue trend is up 12.4% week-over-week\n• Top-performing category: Pizza\n• Most active restaurant: Bella Italia\n\nFor a deeper analysis, please ask a more specific question.`;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      role: "ai",
      text: "Hi Alex! 👋 I'm your FoodHub AI assistant. I can help you analyze sales, customer behavior, restaurant performance, delivery metrics and more. What would you like to know?",
      ts: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: Msg = {
      id: Date.now(),
      role: "user",
      text,
      ts: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = SAMPLE_REPLIES[text] || genericReply(text);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "ai",
          text: reply,
          ts: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setTyping(false);
    }, 1100);
  };

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        description="Conversational analytics powered by FoodHub Intelligence"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <ContentCard className="lg:col-span-3 overflow-hidden flex flex-col" >
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111827]">FoodHub AI</h3>
                <p className="text-xs text-[#6B7280]">GPT-powered business analyst</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              Online
            </Badge>
          </div>

          <div ref={listRef} className="flex-1 max-h-[480px] min-h-[400px] overflow-y-auto scrollbar-thin p-5 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                    m.role === "user" ? "bg-gradient-to-br from-slate-500 to-slate-700" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  }`}>
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[78%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-[#F3F4F6] text-[#111827] rounded-tl-sm"
                    }`}>
                      {m.text}
                    </div>
                    <span className="text-[10px] text-[#9CA3AF] mt-1 px-1">{m.ts}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#F3F4F6] flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-[#E5E7EB]">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-primary text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  {s}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your food business..."
                className="flex-1 h-11 px-4 rounded-xl bg-[#F3F4F6] border border-transparent text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Button type="submit" disabled={!input || typing} className="h-11 w-11 rounded-xl bg-primary hover:bg-blue-700 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </ContentCard>

        {/* Right side: capabilities */}
        <ContentCard className="p-5 h-fit">
          <h3 className="text-base font-semibold text-[#111827] mb-1">What I can do</h3>
          <p className="text-xs text-[#6B7280] mb-4">A few ways I can help you today</p>
          <div className="space-y-2">
            {[
              { icon: "📊", title: "Sales Analytics", desc: "Revenue trends, top performers" },
              { icon: "👥", title: "Customer Insights", desc: "Cohorts, churn, lifetime value" },
              { icon: "🏪", title: "Restaurant Performance", desc: "Ratings, speed, cancellations" },
              { icon: "🚴", title: "Delivery Metrics", desc: "ETA accuracy, rider stats" },
              { icon: "📈", title: "Forecasting", desc: "Predict next week's demand" },
              { icon: "⚠️", title: "Anomaly Detection", desc: "Spot unusual patterns" },
            ].map((cap, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-lg shrink-0">{cap.icon}</div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">{cap.title}</p>
                  <p className="text-xs text-[#6B7280]">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl gradient-premium text-white text-xs">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-semibold">AI Pro</span>
            </div>
            <p className="text-blue-50/90">Unlock advanced forecasting & natural language reports.</p>
            <button className="mt-2 w-full bg-white text-blue-700 hover:bg-blue-50 text-xs font-semibold py-1.5 rounded-lg transition-colors">
              Upgrade
            </button>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
