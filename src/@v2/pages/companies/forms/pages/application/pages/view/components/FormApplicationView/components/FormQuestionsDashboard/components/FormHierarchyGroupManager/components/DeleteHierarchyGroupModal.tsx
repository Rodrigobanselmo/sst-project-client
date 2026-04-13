import WarningIcon from '@mui/icons-material/Warning';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';

interface DeleteHierarchyGroupModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  groupName: string;
  loading?: boolean;
}

export const DeleteHierarchyGroupModal = ({
  open,
  onClose,
  onConfirm,
  groupName,
  loading = false,
}: DeleteHierarchyGroupModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <SFlex alignItems="center" gap={2}>
          <WarningIcon color="error" />
          <Typography variant="h6">Excluir Agrupamento</Typography>
        </SFlex>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Tem certeza que deseja excluir o agrupamento{' '}
          <strong>"{groupName}"</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={2}>
          Esta ação não poderá ser desfeita. Os setores individuais não serão
          afetados, apenas o agrupamento será removido.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <SButton onClick={onClose} text="Cancelar" variant="outlined" />
        <SButton
          onClick={onConfirm}
          text="Excluir"
          variant="contained"
          color="danger"
          loading={loading}
        />
      </DialogActions>
    </Dialog>
  );
};
