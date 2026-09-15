"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Upload, RefreshCw, Copy, ImageIcon, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  size: number;
  folder: string;
  uploadedAt: string;
}

const FALLBACK_FILES: UploadedFile[] = [
  { id: "u-1", url: "https://placehold.co/400x300/6366f1/white?text=Banner", name: "hero-banner.jpg", size: 184320, folder: "banners", uploadedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "u-2", url: "https://placehold.co/200x200/ec4899/white?text=Logo", name: "logo.png", size: 28672, folder: "branding", uploadedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "u-3", url: "https://placehold.co/300x300/10b981/white?text=Product", name: "product-1.jpg", size: 92160, folder: "products", uploadedAt: new Date(Date.now() - 259200000).toISOString() },
  { id: "u-4", url: "https://placehold.co/120x120/amber/white?text=Avatar", name: "avatar.png", size: 12288, folder: "avatars", uploadedAt: new Date(Date.now() - 345600000).toISOString() },
];

const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

export default function FileManagerPage() {
  const [files, setFiles] = useState<UploadedFile[]>(FALLBACK_FILES);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState("uploads");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setSelectedFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const upload = async () => {
    if (!selectedFile) {
      toast.error("Choose a file first");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      form.append("folder", folder || "uploads");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      const newFile: UploadedFile = {
        id: `local-${Date.now()}`,
        url: json.url,
        name: selectedFile.name,
        size: selectedFile.size,
        folder: folder || "uploads",
        uploadedAt: new Date().toISOString(),
      };
      setFiles((arr) => [newFile, ...arr]);
      toast.success("File uploaded");
      setSelectedFile(null);
      setPreview(null);
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">File Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload images to the public-assets bucket. Files are publicly accessible via the returned URL.
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center text-emerald-700">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Upload a File</CardTitle>
                <CardDescription>PNG, JPG, WebP, GIF, SVG · up to 5 MB</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="fm-folder">Folder</Label>
                <Input
                  id="fm-folder"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="banners"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="fm-file">Choose image</Label>
                <Input
                  id="fm-file"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                />
              </div>
            </div>
            {preview && (
              <div className="mt-4 flex items-center gap-4 rounded-lg border p-3 bg-white">
                <div className="w-20 h-20 rounded-md overflow-hidden border border-border flex items-center justify-center bg-muted shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{selectedFile?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedFile ? formatBytes(selectedFile.size) : ""} · {selectedFile?.type}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button
                onClick={upload}
                disabled={!selectedFile || uploading}
                className="bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-90 text-white"
              >
                <Upload className="w-4 h-4 mr-1.5" />
                {uploading ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="bg-white rounded-2xl border-[#E5E7EB] shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Recent Uploads</CardTitle>
          <CardDescription>{files.length} files in this session</CardDescription>
        </CardHeader>
        <CardContent>
          {uploading && files.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center">
              <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-3">No files uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="rounded-xl border border-border overflow-hidden bg-white hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt={f.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-foreground truncate">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {f.folder} · {formatBytes(f.size)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 flex-1 text-xs rounded-md"
                        onClick={() => copyUrl(f.url)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy URL
                      </Button>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Open"
                      >
                        <LinkIcon className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
