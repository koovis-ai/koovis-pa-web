'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Paperclip, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import type { UploadResponse } from '@/types';

interface FileUploadProps {
  onFilesReady: (fileIds: string[]) => void;
  disabled?: boolean;
}

interface PendingFile {
  id: string;
  name: string;
  type: string;
  preview?: string;
  uploading: boolean;
  fileId?: string;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'application/pdf': ['.pdf'],
  'text/*': ['.txt', '.md', '.csv', '.json'],
};

export function FileUpload({ onFilesReady, disabled }: FileUploadProps) {
  const [files, setFiles] = useState<PendingFile[]>([]);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await apiFetch<UploadResponse>('/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set multipart boundary
      });

      return data.file_id;
    } catch {
      toast.error(`Failed to upload ${file.name}`);
      return null;
    }
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: PendingFile[] = acceptedFiles.map((f) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        type: f.type,
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        uploading: true,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      const results = await Promise.all(
        acceptedFiles.map(async (file, i) => {
          const fileId = await uploadFile(file);
          setFiles((prev) =>
            prev.map((pf) =>
              pf.id === newFiles[i].id
                ? { ...pf, uploading: false, fileId: fileId || undefined }
                : pf
            )
          );
          return fileId;
        })
      );

      const successIds = results.filter(Boolean) as string[];
      if (successIds.length > 0) {
        onFilesReady(successIds);
      }
    },
    [uploadFile, onFilesReady]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    noClick: true,
    noKeyboard: true,
    disabled,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/5">
          <p className="text-sm font-medium text-primary">Drop files here</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-1 pb-1">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2 py-1 text-xs"
            >
              {file.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-6 w-6 rounded object-cover"
                />
              ) : file.type.startsWith('image/') ? (
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="max-w-[80px] truncate">{file.name}</span>
              {file.uploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={open}
            disabled={disabled}
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Attach file</TooltipContent>
      </Tooltip>
    </div>
  );
}
