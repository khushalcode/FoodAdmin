"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import { PageHeader, ContentCard } from "../../shared/list-page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuthVendor } from "../../login-page";

interface VendorAddProductProps {
  vendor: AuthVendor | null;
}

const CATEGORIES = [
  "Pizza", "Burgers", "Sushi", "Salads", "Curry", "Noodles",
  "Mexican", "Breakfast", "Pasta", "Rice", "Soups", "Desserts",
  "Drinks", "Healthy", "Vegan", "Seafood",
];

export default function VendorAddProduct({ vendor }: VendorAddProductProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [discount, setDiscount] = useState("");
  const [description, setDescription] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error("Product name and price are required");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Product submitted (demo)", {
        description: `${name} · $${price} · category: ${category || "Uncategorized"}`,
      });
      setName("");
      setPrice("");
      setStock("");
      setDiscount("");
      setDescription("");
      setIsVeg(true);
      setIsFeatured(false);
      setCategory("");
    }, 800);
  };

  return (
    <div>
      <PageHeader
        title="Add Product"
        description={vendor ? `Create a new menu item for ${vendor.storeName}` : "Create a new menu item"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ContentCard className="lg:col-span-2 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[#374151] text-sm font-medium">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Margherita Pizza"
                className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-[#374151] text-sm font-medium">
                  Price ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="12.99"
                  className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock" className="text-[#374151] text-sm font-medium">
                  Stock Quantity
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="100"
                  className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="discount" className="text-[#374151] text-sm font-medium">
                  Discount (%)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#374151] text-sm font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[#374151] text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the dish, ingredients, allergens, etc."
                className="min-h-[100px] rounded-lg bg-white border-[#E5E7EB] focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="veg"
                  checked={isVeg}
                  onCheckedChange={(v) => setIsVeg(Boolean(v))}
                  className="border-[#9CA3AF] data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <label htmlFor="veg" className="text-sm text-[#4B5563] cursor-pointer select-none flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-flex items-center justify-center text-white text-[8px] font-bold">V</span>
                  Vegetarian
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={(v) => setIsFeatured(Boolean(v))}
                  className="border-[#9CA3AF] data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <label htmlFor="featured" className="text-sm text-[#4B5563] cursor-pointer select-none">
                  Featured item
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-6 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold text-sm shadow-sm disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Submit Product
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setName(""); setPrice(""); setStock(""); setDiscount("");
                  setDescription(""); setIsVeg(true); setIsFeatured(false); setCategory("");
                  toast.info("Form cleared");
                }}
                className="h-11 px-5 rounded-lg border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
              >
                Clear
              </Button>
            </div>
          </form>
        </ContentCard>

        {/* Preview card */}
        <ContentCard className="overflow-hidden h-fit sticky top-20">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-base font-semibold text-[#111827]">Live Preview</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">How customers will see this</p>
          </div>
          <div className="p-5">
            <motion.div
              key={`${name}-${price}-${isVeg}-${isFeatured}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#E5E7EB] overflow-hidden"
            >
              <div className="relative h-32 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                {name ? (
                  <span className="text-5xl">{name[0].toUpperCase()}</span>
                ) : (
                  <ImageIcon className="w-10 h-10 text-[#9CA3AF]" />
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  {isVeg && (
                    <span className="w-5 h-5 rounded bg-emerald-500 inline-flex items-center justify-center text-white text-[10px]">V</span>
                  )}
                  {isFeatured && (
                    <span className="w-5 h-5 rounded bg-amber-500 inline-flex items-center justify-center text-white text-[10px]">★</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-semibold text-[#111827]">{name || "Product name"}</h4>
                <p className="text-xs text-[#6B7280] mt-0.5">{category || "Uncategorized"}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-bold text-primary">
                    ${price ? Number(price).toFixed(2) : "0.00"}
                  </span>
                  {discount && Number(discount) > 0 && (
                    <span className="text-xs text-[#9CA3AF] line-through">
                      ${(Number(price) / (1 - Number(discount) / 100)).toFixed(2)}
                    </span>
                  )}
                </div>
                {stock && (
                  <p className="text-xs text-emerald-600 mt-1">{stock} in stock</p>
                )}
              </div>
            </motion.div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
