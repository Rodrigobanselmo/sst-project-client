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

export type HoMethodCreateRiskAiContext = {
  origin: 'ho-method-import' | 'ho-method-manual';
  methodInstitution?: string;
  methodCode?: string;
  methodDisplayName?: string;
  pdfObservations?: string;
  parseWarnings?: string[];
  methodContext?: string;
};

type HoMethodCreateRiskDialogProps = {
  open: boolean;
  initialData: Partial<typeof initialAddRiskState>;
  aiContext?: HoMethodCreateRiskAiContext;
  onClose: () => void;
  onCreated: (risk: IRiskFactors) => void;
};

export const HoMethodCreateRiskDialog: FC<HoMethodCreateRiskDialogProps> = ({
  open,
  initialData,
  aiContext,
  onClose,
  onCreated,
}) => {
  const props = useAddRisk({
    initialData,
    disableModalClose: true,
    riskEditorLayout: 'inline',
    onCancel: onClose,
    aiSuggestionSourceContext: {
      origin: aiContext?.origin ?? 'ho-method-manual',
      methodInstitution: aiContext?.methodInstitution,
      methodCode: aiContext?.methodCode,
      methodDisplayName: aiContext?.methodDisplayName,
    },
    aiSuggestionKnownDataExtras: {
      pdfObservations: aiContext?.pdfObservations,
      parseWarnings: aiContext?.parseWarnings,
      methodContext: aiContext?.methodContext,
    },
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
