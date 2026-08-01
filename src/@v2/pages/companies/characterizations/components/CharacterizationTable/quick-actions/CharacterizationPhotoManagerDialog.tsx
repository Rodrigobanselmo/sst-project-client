import { useCallback, useEffect, useRef, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import {
  initialPhotoState,
  IUploadPhotoConfirm,
} from 'components/organisms/modals/ModalUploadPhoto';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useMutAddCharacterizationPhoto } from 'core/services/hooks/mutations/manager/useMutAddCharacterizationPhoto';
import { useMutDeleteCharacterizationPhoto } from 'core/services/hooks/mutations/manager/useMutDeleteCharacterizationPhoto';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';
import { useSnackbar } from 'notistack';

import { invalidateCharacterizationInventory } from './invalidate-characterization-inventory';

type CharacterizationPhotoManagerDialogProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  row: CharacterizationBrowseResultModel | null;
  /** Se true, abre o upload unitário compacto (fluxo do "+"). */
  preferAdd?: boolean;
};

type BulkSummary = {
  successCount: number;
  failedNames: string[];
};

export function CharacterizationPhotoManagerDialog({
  open,
  onClose,
  companyId,
  workspaceId,
  row,
  preferAdd = false,
}: CharacterizationPhotoManagerDialogProps) {
  const characterizationId = row?.id || '';
  const { onStackOpenModal } = useModal();
  const { preventDelete } = usePreventAction();
  const { enqueueSnackbar } = useSnackbar();
  const addPhotoMutation = useMutAddCharacterizationPhoto();
  const deletePhotoMutation = useMutDeleteCharacterizationPhoto();
  const didAutoAddRef = useRef(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<BulkSummary | null>(null);

  const {
    data: detail,
    isLoading,
    refetch,
  } = useQueryCharacterization(open ? characterizationId : '', {
    companyId,
    workspaceId,
  });

  const photos = detail?.photos || [];

  const refresh = useCallback(async () => {
    await refetch();
    await invalidateCharacterizationInventory({
      companyId,
      workspaceId,
      characterizationId,
    });
  }, [companyId, workspaceId, characterizationId, refetch]);

  /** Fluxo compacto do "+" — uma fotografia por vez (reusa ModalUploadPhoto). */
  const onAddPhotoUnitary = useCallback(() => {
    if (!characterizationId) return;
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      onConfirm: async (photo: { name: string; file: File }) => {
        await addPhotoMutation
          .mutateAsync({
            companyCharacterizationId: characterizationId,
            name: photo.name || photo.file.name,
            file: photo.file,
            workspaceId,
          })
          .then(() => refresh())
          .catch(() => {});
      },
    } as Partial<typeof initialPhotoState>);
  }, [
    characterizationId,
    onStackOpenModal,
    addPhotoMutation,
    workspaceId,
    refresh,
  ]);

  /**
   * Gerenciador — multiarquivo via o mesmo contrato da edição completa
   * (`enableBulkUpload` + `onConfirmBulk` em ModalUploadPhoto / useEditCharacterization).
   */
  const onAddPhotosBulk = useCallback(() => {
    if (!characterizationId) return;
    setBulkSummary(null);
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: row?.name || '',
      enableBulkUpload: true,
      onConfirm: async (photo: IUploadPhotoConfirm) => {
        if (!photo.file) return;
        await addPhotoMutation
          .mutateAsync({
            companyCharacterizationId: characterizationId,
            name: photo.name || photo.file.name,
            file: photo.file,
            workspaceId,
          })
          .then(() => refresh())
          .catch(() => {});
      },
      onConfirmBulk: async (batch: IUploadPhotoConfirm[]) => {
        if (!batch.length) {
          return { successCount: 0, failedFiles: [] as File[] };
        }

        setBulkBusy(true);
        let successCount = 0;
        const failedFiles: File[] = [];

        // Sequencial — mesmo endpoint unitário da edição completa.
        for (const photo of batch) {
          if (!photo.file) continue;
          try {
            await addPhotoMutation.mutateAsync({
              companyCharacterizationId: characterizationId,
              name: photo.name || photo.file.name,
              file: photo.file,
              workspaceId,
              silent: true,
            });
            successCount += 1;
          } catch {
            failedFiles.push(photo.file);
          }
        }

        await refresh();
        setBulkBusy(false);

        const failedNames = failedFiles.map((f) => f.name);
        setBulkSummary({ successCount, failedNames });

        if (failedFiles.length && successCount) {
          enqueueSnackbar(
            `${successCount} foto(s) incluída(s) e ${failedFiles.length} falha(ram). As que falharam permanecem no modal para nova tentativa.`,
            { variant: 'warning', autoHideDuration: 6000 },
          );
        } else if (failedFiles.length) {
          enqueueSnackbar(
            `Falha ao incluir ${failedFiles.length} foto(s). Tente novamente.`,
            { variant: 'error', autoHideDuration: 5000 },
          );
        } else {
          enqueueSnackbar(
            successCount === 1
              ? 'Foto incluída com sucesso'
              : `${successCount} fotos incluídas com sucesso`,
            { variant: 'success' },
          );
        }

        return { successCount, failedFiles };
      },
    } as Partial<typeof initialPhotoState>);
  }, [
    characterizationId,
    onStackOpenModal,
    row?.name,
    addPhotoMutation,
    workspaceId,
    refresh,
    enqueueSnackbar,
  ]);

  useEffect(() => {
    if (!open) {
      didAutoAddRef.current = false;
      setBulkSummary(null);
      return;
    }
    if (
      !preferAdd ||
      !characterizationId ||
      isLoading ||
      didAutoAddRef.current
    )
      return;
    didAutoAddRef.current = true;
    onAddPhotoUnitary();
  }, [open, preferAdd, characterizationId, isLoading, onAddPhotoUnitary]);

  const onDeletePhoto = (photoId: string) => {
    preventDelete(() => {
      setBusyId(photoId);
      void deletePhotoMutation
        .mutateAsync({ id: photoId, workspaceId })
        .then(() => refresh())
        .finally(() => setBusyId(null));
    });
  };

  const handleClose = async () => {
    await invalidateCharacterizationInventory({
      companyId,
      workspaceId,
      characterizationId,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        Fotos — {row?.name || 'Elemento'}
        <IconButton
          aria-label="Fechar"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={2} display="flex" alignItems="center" gap={1.5}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={onAddPhotosBulk}
            disabled={addPhotoMutation.isLoading || bulkBusy}
          >
            Adicionar fotografias
          </Button>
          {bulkBusy && <CircularProgress size={18} />}
        </Box>
        {bulkSummary && (
          <Alert
            severity={
              bulkSummary.failedNames.length
                ? bulkSummary.successCount
                  ? 'warning'
                  : 'error'
                : 'success'
            }
            sx={{ mb: 2 }}
            onClose={() => setBulkSummary(null)}
          >
            {bulkSummary.successCount > 0 && (
              <Typography fontSize={13}>
                {bulkSummary.successCount} fotografia(s) incluída(s).
              </Typography>
            )}
            {bulkSummary.failedNames.length > 0 && (
              <Typography fontSize={13}>
                Falha: {bulkSummary.failedNames.join(', ')}
              </Typography>
            )}
          </Alert>
        )}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : photos.length === 0 ? (
          <Typography color="text.secondary">
            Nenhuma fotografia vinculada.
          </Typography>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(140px, 1fr))"
            gap={1.5}
          >
            {photos.map((photo) => (
              <Box
                key={photo.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <Box
                  component="img"
                  src={photo.photoUrl || (photo as { url?: string }).url}
                  alt={photo.name || 'foto'}
                  sx={{
                    width: '100%',
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                />
                <Typography noWrap fontSize={12}>
                  {photo.name || 'Sem nome'}
                </Typography>
                <Tooltip title="Excluir fotografia">
                  <IconButton
                    size="small"
                    color="error"
                    disabled={busyId === photo.id}
                    onClick={() => onDeletePhoto(photo.id)}
                    aria-label="Excluir fotografia"
                  >
                    {busyId === photo.id ? (
                      <CircularProgress size={14} />
                    ) : (
                      <DeleteIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
