"use client";

import { cn } from "@/lib/utils";
import {
  useMediaUpload,
  UseMediaUploadOptions,
  ManagedFile,
} from "@/hooks/useMediaUpload";
import { DropZone, DropZoneVariant } from "@/components/DropZone";

interface MediaUploadProps extends UseMediaUploadOptions {
  variant?: DropZoneVariant;
  showList?: boolean;
  className?: string;
  label?: string;
  hint?: string;
}

export function MediaUpload({
  variant = "inline",
  mode = "auto",
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 5,
  showList = true,
  className,
  label = "Upload image",
  hint,
  ...hookOptions
}: MediaUploadProps) {
  const { files, isUploading, stage, upload, remove } = useMediaUpload({
    mode,
    multiple,
    maxFiles,
    maxSizeMB,
    ...hookOptions,
  });

  const singleFile = !multiple ? files[0] : undefined;
  const hasPreview = !!singleFile?.preview;

  const hasStagedFiles = files.some((f) => f.status === "staged");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative">
        {hasPreview ? (
          <div
            className={cn(
              "relative overflow-hidden group",
              variant === "avatar" && "w-28 h-28 rounded-full",
              variant === "cover" && "w-full h-36 rounded-xl",
              variant === "logo" && "w-44 h-24 rounded-lg",
              variant === "gallery" && "w-full h-24 rounded-xl",
              variant === "inline" && "w-full h-28 rounded-xl",
            )}
          >
            <img
              src={singleFile.preview}
              alt="preview"
              className="w-full h-full object-cover"
            />

            <DropZone
              onFiles={stage}
              variant={variant}
              multiple={multiple}
              maxSizeMB={maxSizeMB}
              isUploading={isUploading}
              className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 border-none! rounded-none! flex items-center justify-center transition-opacity duration-150"
              label="Replace"
            />

            {singleFile.status === "uploading" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${singleFile.progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <DropZone
            onFiles={stage}
            variant={variant}
            multiple={multiple}
            maxFiles={maxFiles}
            maxSizeMB={maxSizeMB}
            isUploading={isUploading}
            label={label}
            hint={hint}
          />
        )}
      </div>

      {multiple && showList && files.length > 0 && (
        <FileList
          files={files}
          onRemove={(id) => remove(id, { fromBucket: true })}
        />
      )}

      {!multiple && singleFile?.error && (
        <p className="text-[11px] text-destructive">{singleFile.error}</p>
      )}

      {mode === "manual" && hasStagedFiles && (
        <button
          type="button"
          onClick={() => void upload()}
          disabled={isUploading}
          className="self-start rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      )}
    </div>
  );
}

function FileList({
  files,
  onRemove,
}: {
  files: ManagedFile[];
  onRemove: (id: string) => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {files.map((f) => (
        <li
          key={f.id}
          className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background"
        >
          <img
            src={f.preview}
            alt=""
            className="w-10 h-10 rounded-md object-cover shrink-0"
          />

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {f.file.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatBytes(f.file.size)}
            </p>

            {f.status === "staged" && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Waiting…
              </p>
            )}

            {f.status === "uploading" && (
              <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${f.progress}%` }}
                />
              </div>
            )}

            {f.status === "done" && (
              <p className="text-[11px] text-emerald-500 mt-0.5">Uploaded</p>
            )}

            {f.status === "error" && (
              <p className="text-[11px] text-destructive mt-0.5">{f.error}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(f.id)}
            aria-label={`Remove ${f.file.name}`}
            className="text-muted-foreground/50 hover:text-destructive transition-colors text-sm shrink-0"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
