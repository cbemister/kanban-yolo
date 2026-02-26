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
      // Get presigned URL
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

      // Upload to S3 via presigned PUT
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!s3Res.ok) { toast.error("Upload to storage failed"); return; }

      // Create attachment record
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
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv"
      />
      {uploading ? (
        <p className="text-sm" style={{ color: "#888888" }}>Uploading...</p>
      ) : (
        <p className="text-sm" style={{ color: "#888888" }}>
          Drop a file or click to upload (max 10 MB)
        </p>
      )}
    </div>
  );
}
