import { useState, useCallback } from "react";
import { api } from "core/services/apiClient";

const AI_CHAT_SUPPORTED_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/mpeg', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  text: ['text/plain'],
  spreadsheet: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

export interface PendingAttachment {
  id: string; // File ID from server
  localId: string; // Local unique ID for tracking
  filename: string;
  mimeType: string;
  size: number;
  type: "image" | "video" | "audio" | "document" | "text" | "spreadsheet";
  previewUrl?: string; // Local blob URL for preview
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export interface RejectedFile {
  filename: string;
  mimeType: string;
  reason: string;
}

interface UploadResponse {
  id: string;
  key: string;
  bucket: string;
  region: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export function useFileAttachments() {
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback(
    async (files: FileList | File[]): Promise<RejectedFile[]> => {
      const fileArray = Array.from(files);
      const rejected: RejectedFile[] = [];
      setIsUploading(true);

      for (const file of fileArray) {
        const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Create local preview URL for images
        const previewUrl = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;

        // Determine file type category
        const type = getFileType(file.type);
        if (!type) {
          rejected.push({
            filename: file.name,
            mimeType: file.type,
            reason: "Unsupported file type",
          });
          continue;
        }

        // Add pending attachment
        const pending: PendingAttachment = {
          id: "",
          localId,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          type,
          previewUrl,
          uploadStatus: "uploading",
        };

        setAttachments((prev) => [...prev, pending]);

        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await api.post<UploadResponse>(
            "/ai-chat/files/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          const fileData = response.data;

          // Update attachment with server file ID
          setAttachments((prev) =>
            prev.map((att) =>
              att.localId === localId
                ? {
                    ...att,
                    id: fileData.id,
                    uploadStatus: "complete" as const,
                  }
                : att,
            ),
          );
        } catch (error) {
          console.error("Upload error:", error);
          setAttachments((prev) =>
            prev.map((att) =>
              att.localId === localId
                ? {
                    ...att,
                    uploadStatus: "error" as const,
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : att,
            ),
          );
        }
      }

      setIsUploading(false);
      return rejected;
    },
    [],
  );

  const removeAttachment = useCallback((localId: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.localId === localId);
      // Revoke preview URL to free memory
      if (att?.previewUrl) {
        URL.revokeObjectURL(att.previewUrl);
      }
      return prev.filter((a) => a.localId !== localId);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    // Don't revoke blob URLs here - they're still needed for message display
    // The browser will clean them up when the page is closed/refreshed
    // or when messages are reloaded from DB with S3 URLs
    setAttachments([]);
  }, []);

  const getUploadedFileIds = useCallback(() => {
    return attachments
      .filter((att) => att.uploadStatus === "complete" && att.id)
      .map((att) => att.id);
  }, [attachments]);

  /** Get metadata for all successfully uploaded attachments */
  const getUploadedAttachments = useCallback(() => {
    return attachments
      .filter((att) => att.uploadStatus === "complete" && att.id)
      .map((att) => ({
        id: att.id,
        fileId: att.id,
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.size,
        url: att.previewUrl ?? null,
      }));
  }, [attachments]);

  return {
    attachments,
    isUploading,
    addFiles,
    removeAttachment,
    clearAttachments,
    getUploadedFileIds,
    getUploadedAttachments,
  };
}

function getFileType(
  mimeType: string,
): "image" | "video" | "audio" | "document" | "text" | "spreadsheet" | null {
  if (AI_CHAT_SUPPORTED_TYPES.image.includes(mimeType)) return "image";
  if (AI_CHAT_SUPPORTED_TYPES.video.includes(mimeType)) return "video";
  if (AI_CHAT_SUPPORTED_TYPES.audio.includes(mimeType)) return "audio";
  if (AI_CHAT_SUPPORTED_TYPES.document.includes(mimeType)) return "document";
  if (AI_CHAT_SUPPORTED_TYPES.text.includes(mimeType)) return "text";
  if (AI_CHAT_SUPPORTED_TYPES.spreadsheet.includes(mimeType)) return "spreadsheet";
  return null;
}
