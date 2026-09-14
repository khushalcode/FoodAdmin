"use client";

import { motion } from "framer-motion";
import { type LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
  status?: "active" | "coming-soon" | "beta";
}

export default function PlaceholderPage({
  title,
  description,
  icon: Icon,
  features = [],
  status = "active",
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon className="w-8 h-8" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
                  {status === "coming-soon" && (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                      Coming Soon
                    </Badge>
                  )}
                  {status === "beta" && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      Beta
                    </Badge>
                  )}
                  {status === "active" && (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-[#6B7280] text-sm leading-relaxed">{description}</p>
              </div>
              <Button className="bg-primary hover:bg-blue-700 text-white shrink-0">
                <span>Configure</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {features.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-[#111827]">
                    {feature}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-[#6B7280]">
                    Manage and configure {feature.toLowerCase()} settings for this module.
                  </p>
                  <Button variant="ghost" size="sm" className="mt-3 text-primary hover:text-blue-700 p-0 h-auto">
                    Open →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-blue-100">
        <CardContent className="p-6">
          <p className="text-sm text-blue-900">
            <strong>Connected to your live Supabase database.</strong> This module is part of the
            FoodHub admin panel and uses the same authentication + data as all other tabs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
