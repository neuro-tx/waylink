"use client";

import { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { cn } from "@/lib/utils";

export type DropZoneVariant =
  | "avatar"
  | "cover"
  | "logo"
  | "gallery"
  | "inline";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  variant?: DropZoneVariant;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  isDragActive?: boolean;
  isUploading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  label?: string;
  hint?: string;
}

const SHAPE: Record<DropZoneVariant, string> = {
  avatar: "w-28 h-28 rounded-full",
  cover: "w-full h-36 rounded-xl",
  logo: "w-44 h-20 rounded-lg",
  gallery: "w-full h-28 rounded-xl",
  inline: "w-full h-28 rounded-xl",
};

export function DropZone({
  onFiles,
  variant = "inline",
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 5,
  isUploading = false,
  disabled = false,
  children,
  className,
  label = "Upload image",
  hint,
}: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) onFiles(accepted);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple,
    maxFiles: multiple ? maxFiles : 1,
    disabled: disabled || isUploading,
  });

  if (children) {
    return (
      <div {...getRootProps()} className={className}>
        <input {...getInputProps()} />
        {children}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1",
        "border-[1.5px] border-dashed cursor-pointer transition-colors duration-150",
        SHAPE[variant],
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/40 hover:border-primary/60 hover:bg-primary/5",
        (disabled || isUploading) && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input {...getInputProps()} />

      <UploadIcon className="w-5 h-5 text-muted-foreground shrink-0" />

      <span className="text-xs font-medium text-foreground">{label}</span>

      {hint && (
        <span className="text-xs text-muted-foreground text-center px-3 leading-relaxed">
          {hint}
        </span>
      )}

      {isDragActive && (
        <span className="text-xs font-medium text-primary">Drop to add</span>
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
