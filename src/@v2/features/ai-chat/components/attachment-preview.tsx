import Close from '@mui/icons-material/Close';
import Description from '@mui/icons-material/Description';
import MusicNote from '@mui/icons-material/MusicNote';
import Movie from '@mui/icons-material/Movie';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import TableChart from '@mui/icons-material/TableChart';
import { type PendingAttachment } from '../hooks/use-file-attachments';
import styles from './attachment-preview.module.css';

interface AttachmentPreviewProps {
  attachments: PendingAttachment[];
  onRemove: (localId: string) => void;
}

export function AttachmentPreview({
  attachments,
  onRemove,
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={styles.container}>
      {attachments.map((att) => (
        <div key={att.localId} className={styles.attachment}>
          {/* Thumbnail/Icon */}
          <div className={styles.thumbnail}>
            {att.type === 'image' && att.previewUrl ? (
              <img
                src={att.previewUrl}
                alt={att.filename}
                className={styles.thumbnailImage}
              />
            ) : att.type === 'video' ? (
              <Movie
                style={{ fontSize: 24 }}
                className={styles.thumbnailIcon}
              />
            ) : att.type === 'audio' ? (
              <MusicNote
                style={{ fontSize: 24 }}
                className={styles.thumbnailIcon}
              />
            ) : att.type === 'spreadsheet' ? (
              <TableChart
                style={{ fontSize: 24 }}
                className={styles.thumbnailIcon}
              />
            ) : (
              <Description
                style={{ fontSize: 24 }}
                className={styles.thumbnailIcon}
              />
            )}

            {/* Upload status overlay */}
            {att.uploadStatus === 'uploading' && (
              <div className={styles.uploadingOverlay}>
                <CircularProgress size={20} style={{ color: 'white' }} />
              </div>
            )}
            {att.uploadStatus === 'error' && (
              <div className={styles.errorOverlay}>
                <ErrorOutline style={{ fontSize: 20 }} />
              </div>
            )}
          </div>

          {/* Filename */}
          <span className={styles.filename} title={att.filename}>
            {truncateFilename(att.filename, 15)}
          </span>

          {/* Remove button */}
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemove(att.localId)}
            title="Remover"
          >
            <Close style={{ fontSize: 14 }} />
          </button>
        </div>
      ))}
    </div>
  );
}

function truncateFilename(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  const ext = name.split('.').pop() || '';
  const base = name.slice(0, name.length - ext.length - 1);
  const truncatedBase = base.slice(0, maxLength - ext.length - 4) + '...';
  return `${truncatedBase}.${ext}`;
}
