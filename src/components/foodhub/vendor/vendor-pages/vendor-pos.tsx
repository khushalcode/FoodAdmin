"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Wallet } from "lucide-react";
import { PageHeader, ContentCard } from "../../shared/list-page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchOnce } from "../use-vendor-data";
import type { AuthVendor } from "../../login-page";

interface VendorPosProps {
  vendor: AuthVendor | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  stock: number;
  image: string | null;
}

interface CartItem extends Product {
  qty: number;
}

const EMOJIS = ["🍕", "🍔", "🍣", "🥗", "🍛", "🍜", "🌮", "🥑", "🍝", "🍚", "🍲", "🍫", "🥤", "🧃", "☕", "🍰", "🥘", "🍤"];

export default function VendorPos({ vendor }: VendorPosProps) {
  const url = vendor ? `/api/vendor/products?vendorId=${vendor.id}` : null;
  const { data: products, loading } = useFetchOnce<Product[]>(url);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filtered = (products || []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || p.category === category),
  );
  const cats = ["All", ...Array.from(new Set((products || []).map((p) => p.category || "Uncategorized")))];

  const addToCart = (p: Product) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === p.id);
      if (existing) {
        return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { ...p, qty: 1 }];
    });
  };
  const updateQty = (id: string, delta: number) => {
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0),
    );
  };
  const removeItem = (id: string) => setCart((c) => c.filter((i) => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const checkout = () => {
    if (cart.length === 0) return;
    toast.success("Order placed!", {
      description: `Total: $${total.toFixed(2)} · ${cart.reduce((s, i) => s + i.qty, 0)} items`,
    });
    setCart([]);
  };

  return (
    <div>
      <PageHeader
        title="POS"
        description="Point of sale — create orders on the spot"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product grid */}
        <div className="lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-2.5 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9 h-10 rounded-lg bg-white border-[#E5E7EB]"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 md:pb-0">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 h-10 px-3.5 rounded-lg text-xs font-medium border transition-colors ${
                    category === c
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-sm text-[#6B7280]">
              No products in your store yet. Add products first.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((p, i) => {
                const emoji = EMOJIS[i % EMOJIS.length];
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    whileHover={{ y: -3 }}
                    disabled={p.stock <= 0}
                    className="text-left bg-white rounded-2xl border border-[#E5E7EB] shadow-soft p-3 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-full h-20 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-2">
                      <span className="text-3xl">{emoji}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#111827] truncate">{p.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-primary">${p.price.toFixed(2)}</span>
                      <span className={`text-[10px] font-medium ${p.stock > 5 ? "text-emerald-600" : "text-red-600"}`}>
                        {p.stock} in stock
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart */}
        <ContentCard className="overflow-hidden h-fit sticky top-20">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold text-[#111827]">Cart</h3>
            <span className="ml-auto text-xs text-[#6B7280]">{cart.reduce((s, i) => s + i.qty, 0)} items</span>
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-thin p-3 space-y-2">
            {cart.length === 0 ? (
              <p className="text-center text-sm text-[#9CA3AF] py-8">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#F9FAFB]">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-base font-bold shrink-0">
                    {item.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{item.name}</p>
                    <p className="text-xs text-[#6B7280]">${item.price.toFixed(2)} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-md bg-white border border-[#E5E7EB] inline-flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6]">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-[#111827]">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-md bg-white border border-[#E5E7EB] inline-flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6]">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-6 h-6 rounded-md bg-red-50 text-red-600 inline-flex items-center justify-center hover:bg-red-100 ml-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-[#E5E7EB] space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="font-medium text-[#111827]">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">Tax (8%)</span>
              <span className="font-medium text-[#111827]">${tax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
              <span className="font-semibold text-[#111827]">Total</span>
              <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button variant="outline" size="sm" className="h-9 rounded-lg">
                <Banknote className="w-3.5 h-3.5 mr-1" /> Cash
              </Button>
              <Button variant="outline" size="sm" className="h-9 rounded-lg">
                <CreditCard className="w-3.5 h-3.5 mr-1" /> Card
              </Button>
              <Button variant="outline" size="sm" className="h-9 rounded-lg">
                <Wallet className="w-3.5 h-3.5 mr-1" /> Wallet
              </Button>
            </div>

            <Button
              onClick={checkout}
              disabled={cart.length === 0}
              className="w-full h-11 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold text-sm shadow-sm disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Charge ${total.toFixed(2)}
            </Button>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
