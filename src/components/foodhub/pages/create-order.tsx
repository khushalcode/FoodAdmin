"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Customer { id: string; name: string; email?: string; phone?: string; }
interface Store { id: string; name: string; vendorId?: string; }
interface Item { id: string; name: string; price: number; storeId: string; storeName?: string; }

export default function CreateOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [deliveryMen, setDeliveryMen] = useState<{ id: string; name: string }[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [orderType, setOrderType] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("123 Demo St, Demo City");
  const [dmTips, setDmTips] = useState(0);
  const [deliveryManId, setDeliveryManId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ id: string; total: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cRes, sRes, iRes, dRes] = await Promise.all([
          fetch("/api/customers", { cache: "no-store" }),
          fetch("/api/stores", { cache: "no-store" }),
          fetch("/api/items", { cache: "no-store" }),
          fetch("/api/delivery-men", { cache: "no-store" }),
        ]);
        if (cRes.ok) setCustomers(await cRes.json());
        if (sRes.ok) setStores(await sRes.json());
        if (iRes.ok) setItems(await iRes.json());
        if (dRes.ok) setDeliveryMen((await dRes.json()).map((d: any) => ({ id: d.id, name: d.name })));
      } catch (e) {
        toast.error("Failed to load catalog");
      }
    })();
  }, []);

  const itemsForStore = items.filter((i) => !storeId || String(i.storeId) === storeId);
  const subtotal = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const deliveryFee = 2.5;
  const total = subtotal + deliveryFee + Number(dmTips || 0);

  const setQty = (id: string, qty: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const submit = async () => {
    if (!customerId) return toast.error("Select a customer");
    if (!storeId) return toast.error("Select a store");
    if (Object.keys(selectedItems).length === 0) return toast.error("Add at least one item");
    setSubmitting(true);
    try {
      // Call the admin create-order endpoint
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          storeId,
          items: Object.entries(selectedItems).map(([id, qty]) => ({ itemId: id, quantity: qty })),
          paymentMethod,
          orderType,
          deliveryAddress,
          dmTips: Number(dmTips || 0),
          deliveryManId: deliveryManId || undefined,
          couponCode: couponCode || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setLastOrder({ id: json.orderId, total: json.total ?? total });
      toast.success(`Order #${json.orderId} created — customer + delivery notified via realtime`);

      // Optional: immediately assign delivery man (status → confirmed)
      if (deliveryManId) {
        await fetch("/api/orders-status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: json.orderId, status: "confirmed", deliveryManId }),
        });
        toast.success(`Order #${json.orderId} assigned to DM ${deliveryManId} → confirmed`);
      }
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-aurora border-primary/20">
        <CardHeader>
          <CardTitle className="text-gradient-aurora">Create Order</CardTitle>
          <CardDescription>
            Admin-created order triggers the full realtime flow: customer gets a confirmation,
            vendor sees the new order, delivery (if assigned) gets a notification.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="Pick customer" /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.email || c.phone || c.id})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Restaurant</Label>
            <Select value={storeId} onValueChange={(v) => { setStoreId(v); setSelectedItems({}); }}>
              <SelectTrigger><SelectValue placeholder="Pick store" /></SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Items</Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {itemsForStore.length === 0 && (
                <p className="text-sm text-muted-foreground md:col-span-2 lg:col-span-3">Select a store first.</p>
              )}
              {itemsForStore.map((item) => (
                <Card key={item.id} className="border-primary/15 bg-card/60">
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setQty(item.id, (selectedItems[item.id] || 0) - 1)}>−</Button>
                      <span className="w-6 text-center text-sm">{selectedItems[item.id] || 0}</span>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setQty(item.id, (selectedItems[item.id] || 0) + 1)}>+</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                <SelectItem value="digital_payment">Digital Payment</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Order Type</Label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="take_away">Take Away</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Delivery Address</Label>
            <Textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Delivery Man (optional — auto-assign on confirm)</Label>
            <Select value={deliveryManId} onValueChange={setDeliveryManId}>
              <SelectTrigger><SelectValue placeholder="Leave unassigned" /></SelectTrigger>
              <SelectContent>
                {deliveryMen.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Coupon Code (optional)</Label>
            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME20" />
          </div>

          <div className="space-y-2">
            <Label>DM Tips ($)</Label>
            <Input type="number" min={0} step="0.5" value={dmTips} onChange={(e) => setDmTips(Number(e.target.value))} />
          </div>

          <div className="md:col-span-2 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 to-fuchsia/5 p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">DM Tips</span><span>${Number(dmTips || 0).toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-base border-t pt-2"><span>Total</span><span className="text-gradient-aurora">${total.toFixed(2)}</span></div>
          </div>

          <div className="md:col-span-2 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setSelectedItems({}); setCustomerId(""); setStoreId(""); setDeliveryManId(""); setLastOrder(null); }}>
              Reset
            </Button>
            <Button disabled={submitting} onClick={submit} className="bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90">
              {submitting ? "Creating…" : "Create & Notify"}
            </Button>
          </div>

          {lastOrder && (
            <div className="md:col-span-2 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-4 flex items-center gap-3">
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">SUCCESS</Badge>
              <div>
                <p className="font-medium">Order #{lastOrder.id} created</p>
                <p className="text-xs text-muted-foreground">
                  Total ${lastOrder.total.toFixed(2)} — customer + delivery notified via Supabase Realtime.
                  Watch the Orders page update in real time.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
