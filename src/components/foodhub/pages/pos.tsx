"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Wallet } from "lucide-react";
import { PageHeader, ContentCard } from "../shared/list-page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Margherita Pizza", price: 12.99, category: "Pizza", emoji: "🍕" },
  { id: 2, name: "Pepperoni Pizza", price: 14.99, category: "Pizza", emoji: "🍕" },
  { id: 3, name: "Veggie Pizza", price: 13.49, category: "Pizza", emoji: "🍕" },
  { id: 4, name: "Beef Burger", price: 11.49, category: "Burgers", emoji: "🍔" },
  { id: 5, name: "Chicken Burger", price: 10.49, category: "Burgers", emoji: "🍔" },
  { id: 6, name: "Veggie Burger", price: 9.49, category: "Burgers", emoji: "🍔" },
  { id: 7, name: "Spicy Tuna Roll", price: 16.99, category: "Sushi", emoji: "🍣" },
  { id: 8, name: "Salmon Nigiri", price: 14.49, category: "Sushi", emoji: "🍣" },
  { id: 9, name: "California Roll", price: 12.99, category: "Sushi", emoji: "🍣" },
  { id: 10, name: "Caesar Salad", price: 9.49, category: "Salads", emoji: "🥗" },
  { id: 11, name: "Garden Salad", price: 8.49, category: "Salads", emoji: "🥗" },
  { id: 12, name: "Greek Salad", price: 10.49, category: "Salads", emoji: "🥗" },
  { id: 13, name: "Pad Thai", price: 12.49, category: "Noodles", emoji: "🍜" },
  { id: 14, name: "Ramen", price: 13.99, category: "Noodles", emoji: "🍜" },
  { id: 15, name: "Chicken Tikka", price: 14.99, category: "Curry", emoji: "🍛" },
  { id: 16, name: "Beef Tacos", price: 10.99, category: "Mexican", emoji: "🌮" },
  { id: 17, name: "Coca Cola", price: 2.99, category: "Drinks", emoji: "🥤" },
  { id: 18, name: "Orange Juice", price: 3.49, category: "Drinks", emoji: "🧃" },
  { id: 19, name: "Coffee", price: 3.99, category: "Drinks", emoji: "☕" },
  { id: 20, name: "Chocolate Cake", price: 6.49, category: "Desserts", emoji: "🍰" },
];

const CATS = ["All", "Pizza", "Burgers", "Sushi", "Salads", "Noodles", "Curry", "Mexican", "Drinks", "Desserts"];

interface CartItem extends Product {
  qty: number;
}

export default function PosPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<"Card" | "Cash" | "Wallet">("Card");

  const filtered = PRODUCTS.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (p: Product) => {
    setCart((c) => {
      const found = c.find((i) => i.id === p.id);
      if (found) {
        return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { ...p, qty: 1 }];
    });
  };
  const updateQty = (id: number, delta: number) => {
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };
  const removeFromCart = (id: number) =>
    setCart((c) => c.filter((i) => i.id !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const checkout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    toast.success(`Order placed · $${total.toFixed(2)} via ${payment}`, {
      description: `${cart.reduce((n, i) => n + i.qty, 0)} items • #ORD-${Math.floor(2842 + Math.random() * 100)}`,
    });
    setCart([]);
  };

  return (
    <div>
      <PageHeader
        title="Point of Sale"
        description="Create new orders instantly for in-store customers"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product grid */}
        <div className="lg:col-span-2">
          <ContentCard className="p-4">
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
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-2 mb-3">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                    category === c
                      ? "bg-primary text-white"
                      : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(p)}
                  className="group bg-white border border-[#E5E7EB] rounded-xl p-3 text-left hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {p.emoji}
                  </div>
                  <p className="text-xs font-semibold text-[#111827] line-clamp-1">{p.name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{p.category}</p>
                  <p className="text-sm font-bold text-primary mt-1.5">${p.price}</p>
                </motion.button>
              ))}
            </div>
          </ContentCard>
        </div>

        {/* Cart */}
        <div>
          <ContentCard className="p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#111827] flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                Current Order
              </h3>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-[#6B7280] hover:text-red-600">
                  Clear
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto scrollbar-thin space-y-2 mb-4 pr-1">
              <AnimatePresence initial={false}>
                {cart.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-sm text-[#9CA3AF] py-10"
                  >
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-[#E5E7EB]" />
                    Cart is empty. Tap a product to add.
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#F9FAFB]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-xl">{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#111827] truncate">{item.name}</p>
                        <p className="text-xs text-primary font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-md bg-white border border-[#E5E7EB] inline-flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6]">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-semibold">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-md bg-white border border-[#E5E7EB] inline-flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6]">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-md inline-flex items-center justify-center text-[#9CA3AF] hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {([
                { key: "Card", icon: CreditCard },
                { key: "Cash", icon: Banknote },
                { key: "Wallet", icon: Wallet },
              ] as const).map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPayment(p.key)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                    payment === p.key
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
                  }`}
                >
                  <p.icon className="w-4 h-4" />
                  {p.key}
                </button>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-sm border-t border-[#F3F4F6] pt-3">
              <div className="flex justify-between text-[#6B7280]">
                <span>Subtotal</span>
                <span className="font-medium text-[#111827]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Tax (8%)</span>
                <span className="font-medium text-[#111827]">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base pt-1 border-t border-[#F3F4F6] mt-1">
                <span className="font-semibold text-[#111827]">Total</span>
                <span className="font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={checkout}
              disabled={cart.length === 0}
              className="w-full mt-4 h-11 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold shadow-sm disabled:opacity-50"
            >
              Place Order
            </Button>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
