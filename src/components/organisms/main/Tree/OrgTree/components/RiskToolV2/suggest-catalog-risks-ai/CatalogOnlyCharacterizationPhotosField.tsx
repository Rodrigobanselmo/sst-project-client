import { useMemo, useRef, useState } from 'react';

import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import type { ICharacterizationPhoto } from 'core/interfaces/api/ICharacterization';

import {
  CATALOG_ONLY_ALLOWED_IMAGE_MIME,
  CATALOG_ONLY_MAX_IMAGES_PER_ANALYSIS,
} from './catalog-only-photo-limits.constants';
import {
  compressCatalogOnlyTempImage,
  type CatalogOnlyTemporaryImage,
} from './compress-catalog-only-temp-image.util';

type Props = {
  existingPhotos: ICharacterizationPhoto[];
  selectedExistingIds: Set<string>;
  onToggleExisting: (photoId: string) => void;
  temporaryImages: CatalogOnlyTemporaryImage[];
  onTemporaryChange: (images: CatalogOnlyTemporaryImage[]) => void;
  disabled?: boolean;
};

export function CatalogOnlyCharacterizationPhotosField({
  existingPhotos,
  selectedExistingIds,
  onToggleExisting,
  temporaryImages,
  onTemporaryChange,
  disabled,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedCount =
    selectedExistingIds.size + temporaryImages.length;
  const remainingSlots = Math.max(
    0,
    CATALOG_ONLY_MAX_IMAGES_PER_ANALYSIS - selectedCount,
  );

  const accept = useMemo(
    () => CATALOG_ONLY_ALLOWED_IMAGE_MIME.join(','),
    [],
  );

  const handleAddFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = remainingSlots;
    if (room <= 0) {
      enqueueSnackbar(
        `No máximo ${CATALOG_ONLY_MAX_IMAGES_PER_ANALYSIS} imagens por análise.`,
        { variant: 'warning' },
      );
      return;
    }

    setBusy(true);
    try {
      const next = [...temporaryImages];
      const list = Array.from(files).slice(0, room);
      for (const file of list) {
        try {
          const compressed = await compressCatalogOnlyTempImage(file);
          next.push(compressed);
        } catch (error) {
          enqueueSnackbar(
            error instanceof Error ? error.message : 'Falha ao processar imagem.',
            { variant: 'error' },
          );
        }
      }
      onTemporaryChange(next);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Fotografias para a análise</Typography>
      <Typography variant="body2" color="text.secondary">
        Selecione fotos cadastradas e/ou adicione fotos temporárias só para esta
        análise (máx. {CATALOG_ONLY_MAX_IMAGES_PER_ANALYSIS}). Fotos temporárias
        não são salvas na caracterização.
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Selecionadas: {selectedCount}/{CATALOG_ONLY_MAX_IMAGES_PER_ANALYSIS}
      </Typography>

      {existingPhotos.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
            gap: 1,
          }}
        >
          {existingPhotos.map((photo) => {
            const selected = selectedExistingIds.has(photo.id);
            return (
              <Box
                key={photo.id}
                sx={{
                  position: 'relative',
                  border: '2px solid',
                  borderColor: selected ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <Box
                  component="img"
                  src={photo.photoUrl}
                  alt={photo.name || 'Foto da caracterização'}
                  onClick={() => !disabled && onToggleExisting(photo.id)}
                  sx={{
                    width: '100%',
                    height: 88,
                    objectFit: 'cover',
                    cursor: disabled ? 'default' : 'pointer',
                    display: 'block',
                  }}
                />
                <Chip
                  size="small"
                  label="Cadastrada"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    height: 20,
                    bgcolor: 'rgba(0,0,0,0.55)',
                    color: 'common.white',
                    '& .MuiChip-label': { px: 0.75, fontSize: 10 },
                  }}
                />
                {selected && (
                  <CheckCircleIcon
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'common.white',
                      borderRadius: '50%',
                      fontSize: 20,
                    }}
                  />
                )}
                <Button
                  size="small"
                  onClick={() => setPreviewUrl(photo.photoUrl)}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderRadius: 0,
                    bgcolor: 'rgba(0,0,0,0.45)',
                    color: 'common.white',
                    fontSize: 10,
                    py: 0.25,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                  }}
                >
                  Ampliar
                </Button>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Nenhuma fotografia cadastrada neste elemento.
        </Typography>
      )}

      {temporaryImages.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
            gap: 1,
          }}
        >
          {temporaryImages.map((image) => (
            <Box
              key={image.localId}
              sx={{
                position: 'relative',
                border: '2px dashed',
                borderColor: 'secondary.main',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={image.dataUrl}
                alt={image.fileName}
                sx={{
                  width: '100%',
                  height: 88,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <Chip
                size="small"
                label="Temporária"
                color="secondary"
                sx={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  height: 20,
                  '& .MuiChip-label': { px: 0.75, fontSize: 10 },
                }}
              />
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() =>
                  onTemporaryChange(
                    temporaryImages.filter((item) => item.localId !== image.localId),
                  )
                }
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(255,255,255,0.85)',
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <Button
                size="small"
                onClick={() => setPreviewUrl(image.dataUrl)}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderRadius: 0,
                  bgcolor: 'rgba(0,0,0,0.45)',
                  color: 'common.white',
                  fontSize: 10,
                  py: 0.25,
                }}
              >
                Ampliar
              </Button>
            </Box>
          ))}
        </Box>
      )}

      <Box>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          hidden
          onChange={(event) => void handleAddFiles(event.target.files)}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddPhotoAlternateOutlinedIcon />}
          disabled={disabled || busy || remainingSlots <= 0}
          onClick={() => inputRef.current?.click()}
        >
          Adicionar foto para análise
        </Button>
      </Box>

      <Dialog
        open={Boolean(previewUrl)}
        onClose={() => setPreviewUrl(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 1 }}>
          {previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              alt="Pré-visualização"
              sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
