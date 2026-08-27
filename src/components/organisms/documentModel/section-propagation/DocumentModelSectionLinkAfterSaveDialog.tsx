import { FC } from 'react';

import { Box, Button } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

type Props = {
  open: boolean;
  headingLabel: string;
  changedCount?: number;
  busy?: boolean;
  onApply: () => void;
  onUnlink: () => void;
  onDismiss: () => void;
};

export const DocumentModelSectionLinkAfterSaveDialog: FC<Props> = ({
  open,
  headingLabel,
  changedCount = 1,
  busy,
  onApply,
  onUnlink,
  onDismiss,
}) => {
  const buttons = [
    {
      text: 'Agora não',
      variant: 'outlined',
      disabled: busy,
      onClick: onDismiss,
    },
  ] as IModalButton[];
  const multiple = changedCount > 1;

  return (
    <SModal open={open} onClose={onDismiss}>
      <SModalPaper center p={8} width={['100%', 560]} loading={busy}>
        <SModalHeader onClose={onDismiss} title="Seção vinculada alterada" />
        {multiple ? (
          <SText fontWeight={600} mb={2}>
            Você alterou {changedCount} seções vinculadas.
          </SText>
        ) : (
          <SText fontWeight={600} mb={2}>
            Esta seção está vinculada a outros modelos e foi alterada.
          </SText>
        )}
        <SText color="text.light" mb={6}>
          {headingLabel || 'Seção estrutural'}
        </SText>
        <SText mb={6} maxWidth={520}>
          Nada foi aplicado automaticamente. O conteúdo salvo neste modelo
          permanece como está. Trate uma seção por vez.
        </SText>
        <Box mb={4}>
          <SFlex gap={3} flexWrap="wrap">
            <Button
              variant="contained"
              disabled={busy}
              onClick={onApply}
              sx={{ textTransform: 'none' }}
            >
              Aplicar aos modelos vinculados
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={busy}
              onClick={onUnlink}
              sx={{ textTransform: 'none' }}
            >
              Desvincular esta seção
            </Button>
          </SFlex>
        </Box>
        <SModalButtons onClose={onDismiss} loading={busy} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
