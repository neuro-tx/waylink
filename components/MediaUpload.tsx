"use client";

import { useCallback, useState } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { cn } from "@/lib/utils";

export type UploadVariant = "avatar" | "cover" | "logo" | "gallery" | "inline";

interface MediaUploadProps {
  variant?: UploadVariant;
  keyPrefix: string;
  onUploadComplete?: (url: string, key: string) => void;
  onUploadError?: (err: string) => void;
  accept?: Accept;
  maxSizeMB?: number;
  maxFiles?: number;
  children?: React.ReactNode;
  className?: string;
  label?: string;
  hint?: string;
}

export function MediaUpload({
  variant = "inline",
  keyPrefix,
  onUploadComplete,
  onUploadError,
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  maxSizeMB = 5,
  maxFiles = 1,
  children,
  className,
  label = "Upload image",
  hint,
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToTigris = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const res = await fetch("/api/s3/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: `${keyPrefix}/${Date.now()}-${file.name}`,
          contentType: file.type,
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");
      const { presignedUrl, publicUrl, key } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () =>
          xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(file);
      });

      onUploadComplete?.(publicUrl, key);
    } catch (e: any) {
      const msg = e?.message ?? "Upload failed";
      setError(msg);
      onUploadError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setPreview(URL.createObjectURL(file));
      uploadToTigris(file);
    },
    [keyPrefix],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
    maxFiles: maxFiles,
  });

  const shapeClass: Record<UploadVariant, string> = {
    avatar: "w-24 h-24 rounded-full",
    cover: "w-full h-36 rounded-xl",
    logo: "w-44 h-20 rounded-lg",
    gallery: "w-full h-24 rounded-xl",
    inline: "w-full h-28 rounded-xl",
  };

  if (children) {
    return (
      <div {...getRootProps()} className={className}>
        <input {...getInputProps()} />
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2",
          "border-[1.5px] border-dashed cursor-pointer transition-colors duration-150",
          "bg-background",
          shapeClass[variant],

          isDragActive
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
            : "border-zinc-300 bg-zinc-50 hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-400 dark:hover:bg-blue-950/20",

          preview && "border-none p-0 overflow-hidden",
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <UploadIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              {label}
            </span>
            {hint && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center px-3">
                {hint}
              </span>
            )}
          </>
        )}

        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}
