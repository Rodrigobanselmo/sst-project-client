import { useState, useCallback } from 'react';
import Description from '@mui/icons-material/Description';
import TableChart from '@mui/icons-material/TableChart';
import Close from '@mui/icons-material/Close';
import { type ChatMessageAttachment } from '../hooks/use-ai-chat-stream';
import styles from './message-attachments.module.css';

// Re-export for convenience
export type { ChatMessageAttachment as MessageAttachment };

interface MessageAttachmentsProps {
  files: ChatMessageAttachment[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

function isPdfMimeType(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

function isSpreadsheetMimeType(mimeType: string): boolean {
  return (
    mimeType === 'text/csv' ||
    mimeType === 'application/csv' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

export function MessageAttachments({ files }: MessageAttachmentsProps) {
  const [previewFile, setPreviewFile] = useState<ChatMessageAttachment | null>(
    null,
  );

  const openPreview = useCallback((file: ChatMessageAttachment) => {
    if (file.url) {
      setPreviewFile(file);
    }
  }, []);

  const closePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  if (files.length === 0) return null;

  return (
    <>
      <div className={styles.container}>
        {files.map((file) => {
          const isImage = isImageMimeType(file.mimeType);
          const isPdf = isPdfMimeType(file.mimeType);
          const isSpreadsheet = isSpreadsheetMimeType(file.mimeType);

          if (isImage && file.url) {
            return (
              <div
                key={file.id}
                className={`${styles.attachment} ${styles.imageAttachment}`}
                onClick={() => openPreview(file)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openPreview(file)}
                title={file.filename}
              >
                <img
                  src={file.url}
                  alt={file.filename}
                  className={styles.imagePreview}
                />
              </div>
            );
          }

          // Use appropriate icon based on file type
          const DocumentIcon = isSpreadsheet ? TableChart : Description;

          return (
            <div
              key={file.id}
              className={`${styles.attachment} ${styles.documentAttachment}`}
              onClick={() => openPreview(file)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openPreview(file)}
              title={`Clique para ${isPdf ? 'visualizar' : 'baixar'} ${file.filename}`}
            >
              <DocumentIcon
                style={{ fontSize: 24 }}
                className={styles.documentIcon}
              />
              <div className={styles.documentInfo}>
                <span className={styles.documentFilename}>{file.filename}</span>
                <span className={styles.documentMeta}>
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewFile?.url && (
        <div className={styles.modal} onClick={closePreview}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={closePreview}
              aria-label="Fechar visualização"
            >
              <Close style={{ fontSize: 18 }} />
            </button>
            {isImageMimeType(previewFile.mimeType) ? (
              <img
                src={previewFile.url}
                alt={previewFile.filename}
                className={styles.modalImage}
              />
            ) : isPdfMimeType(previewFile.mimeType) ? (
              <iframe
                src={previewFile.url}
                title={previewFile.filename}
                className={styles.modalPdf}
              />
            ) : (
              <a href={previewFile.url} download={previewFile.filename}>
                Baixar {previewFile.filename}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
