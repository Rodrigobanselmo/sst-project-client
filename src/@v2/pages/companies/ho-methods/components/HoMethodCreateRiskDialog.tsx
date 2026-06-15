import { FC } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { RiskEditorFields } from 'components/organisms/modals/ModalAddRisk/components/RiskEditorFields/RiskEditorFields';
import {
  initialAddRiskState,
  useAddRisk,
} from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

type HoMethodCreateRiskDialogProps = {
  open: boolean;
  initialData: Partial<typeof initialAddRiskState>;
  onClose: () => void;
  onCreated: (risk: IRiskFactors) => void;
};

export const HoMethodCreateRiskDialog: FC<HoMethodCreateRiskDialogProps> = ({
  open,
  initialData,
  onClose,
  onCreated,
}) => {
  const props = useAddRisk({
    initialData,
    disableModalClose: true,
    riskEditorLayout: 'inline',
    onCancel: onClose,
    onSubmitSuccess: (created) => {
      if (created) onCreated(created);
      onClose();
    },
  });

  const { riskData, setRiskData, handleSubmit, onSubmit, onCloseUnsaved, loading } =
    props;

  return (
    <Dialog open={open} onClose={onCloseUnsaved} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={(handleSubmit as any)(onSubmit)}>
        <DialogTitle>Criar fator de risco químico</DialogTitle>
        <DialogContent dividers>
          <RiskEditorFields {...props} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseUnsaved} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            onClick={() => setRiskData({ ...riskData, hasSubmit: true })}
          >
            {loading ? 'Salvando…' : 'Criar fator de risco'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
