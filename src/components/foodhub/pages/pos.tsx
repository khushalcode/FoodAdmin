"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Wallet,
  Loader2,
} from "lucide-react";
import { PageHeader, ContentCard } from "../shared/list-page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  categoryName?: string | null;
  storeName?: string | null;
  storeId?: string | null;
  status?: boolean;
}

const FALLBACK_PRODUCTS: Product[] = [
  { id: "1", name: "Margherita Pizza", price: 12.99, image: null, categoryName: "Pizza", storeName: "Bella Italia", storeId: "1" },
  { id: "2", name: "Pepperoni Pizza", price: 14.99, image: null, categoryName: "Pizza", storeName: "Bella Italia", storeId: "1" },
  { id: "3", name: "Veggie Burger", price: 9.49, image: null, categoryName: "Burgers", storeName: "Burger Bros", storeId: "2" },
  { id: "4", name: "Spicy Tuna Roll", price: 16.99, image: null, categoryName: "Sushi", storeName: "Sushi Express", storeId: "3" },
  { id: "5", name: "Caesar Salad", price: 9.49, image: null, categoryName: "Salads", storeName: "Green Bowl", storeId: "4" },
  { id: "6", name: "Pad Thai", price: 12.49, image: null, categoryName: "Noodles", storeName: "Dragon Wok", storeId: "5" },
  { id: "7", name: "Coca Cola", price: 2.99, image: null, categoryName: "Drinks", storeName: "Bella Italia", storeId: "1" },
  { id: "8", name: "Chocolate Cake", price: 6.49, image: null, categoryName: "Desserts", storeName: "La Petite", storeId: "6" },
];

interface CartItem extends Product {
  qty: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<"Card" | "Cash" | "Wallet">("Card");
  const [placing, setPlacing] = useState(false);
  const [customerId, setCustomerId] = useState("1");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/items?limit=50", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const arr: Product[] = Array.isArray(json) ? json : json.items ?? [];
        if (!cancelled) {
          setProducts(arr.length > 0 ? arr : FALLBACK_PRODUCTS);
        }
      } catch (e: any) {
        // Silent fallback — the page still works with FALLBACK_PRODUCTS
        if (!cancelled) setProducts(FALLBACK_PRODUCTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.storeName || "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  const addToCart = (p: Product) => {
    setCart((c) => {
      const found = c.find((i) => i.id === p.id);
      if (found) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!customerId) {
      toast.error("Customer ID is required");
      return;
    }
    // All items must belong to the same store for a single order
    const storeIds = [...new Set(cart.map((c) => c.storeId).filter(Boolean))] as string[];
    if (storeIds.length > 1) {
      toast.error("All items in a single order must be from the same store");
      return;
    }
    const storeId = storeIds[0];
    if (!storeId) {
      toast.error("Items missing storeId — cannot place order");
      return;
    }

    setPlacing(true);
    try {
      const paymentMethodMap = {
        Card: "digital_payment",
        Cash: "cash_on_delivery",
        Wallet: "wallet",
      } as const;
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: String(customerId),
          storeId: String(storeId),
          items: cart.map((i) => ({ itemId: Number(i.id), quantity: i.qty })),
          paymentMethod: paymentMethodMap[payment],
          orderType: "pos",
          deliveryAddress: deliveryAddress || "In-store POS sale",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      toast.success(`Order #${json.orderId} placed · $${Number(json.total || total).toFixed(2)}`, {
        description: `${cart.reduce((n, i) => n + i.qty, 0)} items via ${payment}`,
      });
      setCart([]);
    } catch (e: any) {
      toast.error(`Failed to place order: ${e.message}`);
    } finally {
      setPlacing(false);
    }
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
              {loading && (
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground self-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading items…
                </span>
              )}
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
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-3xl mb-2 overflow-hidden">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#111827] line-clamp-1">{p.name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">
                    {p.categoryName || p.storeName || "—"}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1.5">${Number(p.price).toFixed(2)}</p>
                </motion.button>
              ))}
              {filtered.length === 0 && !loading && (
                <div className="col-span-full text-center text-sm text-muted-foreground py-10">
                  No products found.
                </div>
              )}
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

            <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-2 mb-4 pr-1">
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
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-lg overflow-hidden">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          "🍽️"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#111827] truncate">{item.name}</p>
                        <p className="text-xs text-primary font-semibold">${Number(item.price).toFixed(2)}</p>
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

            {/* Customer + delivery */}
            <div className="space-y-2 mb-4">
              <Input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Customer ID (e.g. 1)"
                className="h-9 text-sm"
              />
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Note / table no. (optional)"
                className="h-9 text-sm"
              />
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
              disabled={cart.length === 0 || placing}
              className="w-full mt-4 h-11 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold shadow-sm disabled:opacity-50"
            >
              {placing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing…
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
