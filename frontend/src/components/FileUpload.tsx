"use client";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

interface FileUploadProps {
  cardId: string;
  onUploaded: () => void;
}

export default function FileUpload({ cardId, onUploaded }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const urlRes = await fetch(`/api/cards/${cardId}/attachments/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type, fileSize: file.size }),
      });
      if (!urlRes.ok) {
        const err = await urlRes.json();
        toast.error(err.error ?? "Upload failed");
        return;
      }
      const { uploadUrl, publicUrl } = await urlRes.json();

      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!s3Res.ok) { toast.error("Upload to storage failed"); return; }

      await fetch(`/api/cards/${cardId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileUrl: publicUrl, fileSize: file.size, mimeType: file.type }),
      });
      toast.success("Uploaded");
      onUploaded();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="p-4 text-center cursor-pointer transition-colors"
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-color)"}`,
        background: dragging ? "var(--bg-card-hover)" : "transparent",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv"
      />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {uploading ? "Uploading..." : "Drop a file or click to upload (max 10 MB)"}
      </p>
    </div>
  );
}
