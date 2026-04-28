/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';
import { RiskEditorFields } from 'components/organisms/modals/ModalAddRisk/components/RiskEditorFields/RiskEditorFields';
import { useAddRisk } from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

type RiskInlineEditorProps = {
  risk: IRiskFactors;
  onBackToList: () => void;
};

export const RiskInlineEditor: FC<RiskInlineEditorProps> = ({
  risk,
  onBackToList,
}) => {
  const props = useAddRisk({
    initialData: risk as any,
    disableModalClose: true,
    onCancel: onBackToList,
  });

  const { riskData, setRiskData, handleSubmit, onSubmit, onCloseUnsaved, loading } =
    props;

  return (
    <>
      <STableTitle
        subtitle="Edição de fator de risco na própria página"
        icon={SRiskFactorIcon}
      >
        Editar Fator de Risco
      </STableTitle>
      <Box
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
        sx={{
          mt: 6,
          border: '1px solid',
          borderColor: 'background.divider',
          borderRadius: 2,
          p: 8,
          backgroundColor: 'background.paper',
        }}
      >
        <RiskEditorFields {...props} />

        <SFlex justify="end" mt={10} gap={4}>
          <SButton variant="outlined" size="small" onClick={onCloseUnsaved}>
            Cancelar
          </SButton>
          <SButton
            variant="contained"
            size="small"
            type="submit"
            loading={loading}
            onClick={() => setRiskData({ ...riskData, hasSubmit: true })}
          >
            Salvar
          </SButton>
        </SFlex>
      </Box>
    </>
  );
};
