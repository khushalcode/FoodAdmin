"use client";
import PlaceholderPage from "./placeholder-page";
import { FolderOpen } from "lucide-react";
export default function FileManagerPage() {
  return (
    <PlaceholderPage
      title="File Manager"
      description="Upload, organize, and manage all media files — product images, banners, logos, documents."
      icon={FolderOpen}
      features={["Upload", "Folders", "Images", "Documents", "Storage Usage"]}
      status="active"
    />
  );
}
