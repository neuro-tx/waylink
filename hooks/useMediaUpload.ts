"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import pLimit from "p-limit";
import { publicUrl } from "@/lib/tigris";

export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export type FileStatus = "staged" | "uploading" | "done" | "error";

export interface ManagedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: FileStatus;
  result?: UploadedFile;
  error?: string;
}

export type UploadMode = "auto" | "manual";

export interface UseMediaUploadOptions {
  keyPrefix: string;
  mode?: UploadMode;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onComplete?: (file: UploadedFile) => void;
  onAllComplete?: (files: UploadedFile[]) => void;
  onFileUploaded?: (file: UploadedFile, allSoFar: UploadedFile[]) => void;
  onError?: (err: string, fileName: string) => void;
}

export interface UseMediaUploadReturn {
  files: ManagedFile[];
  uploadedFiles: UploadedFile[];
  isUploading: boolean;
  stage: (incoming: File[]) => Promise<UploadedFile[]>;
  upload: () => Promise<UploadedFile[]>;
  remove: (id: string, opts?: { fromBucket?: boolean }) => Promise<void>;
  reset: () => void;
}

type Action =
  | { type: "ADD"; files: ManagedFile[] }
  | { type: "UPDATE"; id: string; patch: Partial<ManagedFile> }
  | { type: "REMOVE"; id: string }
  | { type: "RESET" };

function reducer(state: ManagedFile[], action: Action): ManagedFile[] {
  switch (action.type) {
    case "ADD":
      return [...state, ...action.files];
    case "UPDATE":
      return state.map((f) =>
        f.id === action.id ? { ...f, ...action.patch } : f,
      );
    case "REMOVE":
      return state.filter((f) => f.id !== action.id);
    case "RESET":
      return [];
    default:
      return state;
  }
}

export function useMediaUpload({
  keyPrefix,
  mode = "auto",
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 5,
  onComplete,
  onAllComplete,
  onFileUploaded,
  onError,
}: UseMediaUploadOptions): UseMediaUploadReturn {
  const [files, dispatch] = useReducer(reducer, []);
  const limit = pLimit(5);

  const filesRef = useRef<ManagedFile[]>([]);
  filesRef.current = files;

  const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const update = useCallback((id: string, patch: Partial<ManagedFile>) => {
    dispatch({ type: "UPDATE", id, patch });
  }, []);

  const uploadOne = useCallback(
    async (managed: ManagedFile): Promise<UploadedFile | null> => {
      const { file } = managed;

      update(managed.id, {
        status: "uploading",
        progress: 0,
        error: undefined,
      });

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

        const { presignedUrl, key } = await res.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.onprogress = ({ lengthComputable, loaded, total }) => {
            if (!lengthComputable) return;

            update(managed.id, {
              progress: Math.round((loaded / total) * 100),
            });
          };

          xhr.onload = () => {
            if (xhr.status < 300) resolve();
            else reject(new Error(`HTTP ${xhr.status}`));
          };

          xhr.onerror = () => reject(new Error("Uploading error"));
          xhr.send(file);
        });

        const result: UploadedFile = {
          key,
          url: publicUrl(key),
          name: file.name,
          size: file.size,
          type: file.type,
        };

        update(managed.id, {
          status: "done",
          progress: 100,
          result,
          error: undefined,
        });

        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";

        update(managed.id, {
          status: "error",
          error: msg,
        });

        onError?.(msg, file.name);
        return null;
      }
    },
    [keyPrefix, update, onError],
  );

  const prepareFiles = useCallback(
    (incoming: File[]): ManagedFile[] => {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      const valid = incoming.filter((file) => {
        if (file.size > maxSizeBytes) {
          onError?.(`${file.name} exceeds ${maxSizeMB}MB`, file.name);
          return false;
        }
        return true;
      });

      if (!valid.length) return [];

      const created: ManagedFile[] = valid.map((file) => ({
        id: makeId(),
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "staged",
      }));

      let accepted: ManagedFile[] = [];

      if (!multiple) {
        filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview));
        dispatch({ type: "RESET" });

        accepted = created.slice(0, 1);
      } else {
        const slots = Math.max(0, maxFiles - filesRef.current.length);
        accepted = created.slice(0, slots);

        created.slice(slots).forEach((f) => URL.revokeObjectURL(f.preview));
      }

      if (accepted.length) {
        dispatch({ type: "ADD", files: accepted });
      }

      return accepted;
    },
    [multiple, maxFiles, maxSizeMB, onError],
  );

  const uploadBatch = useCallback(
    async (targets: ManagedFile[]): Promise<UploadedFile[]> => {
      if (!targets.length) return [];

      const results = await Promise.all(
        targets.map((item) => limit(() => uploadOne(item))),
      );

      const succeeded = results.filter(Boolean) as UploadedFile[];

      if (!succeeded.length) return [];

      const alreadyDone = filesRef.current
        .filter((f) => f.status === "done" && f.result)
        .map((f) => f.result!);

      const seen = new Set<string>();
      const allSoFar: UploadedFile[] = [];

      for (const file of alreadyDone) {
        if (!seen.has(file.key)) {
          seen.add(file.key);
          allSoFar.push(file);
        }
      }

      for (const uploaded of succeeded) {
        if (!seen.has(uploaded.key)) {
          seen.add(uploaded.key);
          allSoFar.push(uploaded);
        }

        onFileUploaded?.(uploaded, [...allSoFar]);
      }

      if (!multiple && succeeded[0]) {
        onComplete?.(succeeded[0]);
      }

      onAllComplete?.(succeeded);

      return succeeded;
    },
    [limit, uploadOne, multiple, onComplete, onAllComplete, onFileUploaded],
  );

  const stage = useCallback(
    async (incoming: File[]): Promise<UploadedFile[]> => {
      const accepted = prepareFiles(incoming);

      if (!accepted.length) return [];

      if (mode === "manual") {
        return [];
      }

      return uploadBatch(accepted);
    },
    [prepareFiles, mode, uploadBatch],
  );

  const upload = useCallback(async (): Promise<UploadedFile[]> => {
    const staged = filesRef.current.filter((f) => f.status === "staged");
    return uploadBatch(staged);
  }, [uploadBatch]);

  const remove = useCallback(
    async (id: string, opts?: { fromBucket?: boolean }) => {
      const target = filesRef.current.find((f) => f.id === id);
      if (!target) return;

      URL.revokeObjectURL(target.preview);

      if (opts?.fromBucket && target.result?.key) {
        try {
          await fetch("/api/s3/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: target.result.key }),
          });
        } catch {
          // best-effort
        }
      }

      dispatch({ type: "REMOVE", id });
    },
    [],
  );

  const reset = useCallback(() => {
    filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview));
    dispatch({ type: "RESET" });
  }, []);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, []);

  const uploadedFiles = files
    .filter((f) => f.status === "done" && f.result)
    .map((f) => f.result!);

  const isUploading = files.some((f) => f.status === "uploading");

  return {
    files,
    uploadedFiles,
    isUploading,
    stage,
    upload,
    remove,
    reset,
  };
}
