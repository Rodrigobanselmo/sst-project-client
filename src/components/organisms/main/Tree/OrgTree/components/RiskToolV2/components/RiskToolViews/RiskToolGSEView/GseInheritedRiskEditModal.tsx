import React, { FC } from 'react';

import { Box, Button } from '@mui/material';
import SModal, {
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import SText from 'components/atoms/SText';

import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { RiskCatalogDropLock } from '../../../risk-catalog-dnd/RiskCatalogDndProvider';
import { RiskToolSingleRiskRow } from '../../SideRowTable/SingleRisk';
import { formatGseEffectiveOriginLabel } from './split-effective-gse-rows.util';
import { RiskToolGSEViewRowRiskBox } from './Row/RiskBox';

type GseInheritedRiskEditModalProps = {
  open: boolean;
  onClose: () => void;
  risk: IRiskFactors;
  riskData: IRiskData;
  riskGroupId: string;
};

export const GseInheritedRiskEditModal: FC<GseInheritedRiskEditModalProps> = ({
  open,
  onClose,
  risk,
  riskData,
  riskGroupId,
}) => {
  const originLabel = formatGseEffectiveOriginLabel(riskData);
  const originHomogeneousGroupId = riskData.homogeneousGroupId;
  const originType = riskData.originTypeLabel?.trim() || 'origem original';

  if (!originHomogeneousGroupId || !riskData.id) return null;

  return (
    <SModal open={open} onClose={onClose} keepMounted={false}>
      <SModalPaper
        p={8}
        center
        sx={{
          width: 'calc(100vw - 48px)',
          minWidth: 'calc(100vw - 48px)',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 48px)',
          overflow: 'auto',
          overflowX: 'auto',
        }}
      >
        <SModalHeader
          tag="edit"
          title="Editar ocorrência na origem"
          subtitle={
            originLabel
              ? `${originLabel}\nA alteração é salva no ${originType}, não neste GSE.`
              : `A alteração é salva na origem original, não neste GSE.`
          }
          onClose={onClose}
        />
        <SText fontSize={12} color="text.secondary" sx={{ mb: 3 }}>
          Cada campo é gravado na hora, como no editor da origem. Fechar não
          desfaz o que já foi salvo.
        </SText>
        <RiskCatalogDropLock>
          <Box
            sx={{
              border: '1.5px solid',
              borderColor: 'grey.400',
              borderRadius: 1,
              overflow: 'visible',
              minWidth: 1100,
            }}
          >
            <RiskToolGSEViewRowRiskBox
              riskData={riskData}
              data={risk}
              hide
              riskGroupId={riskGroupId}
              expanded
              framed
              showOrigin={false}
              showOriginActions={false}
            />
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <RiskToolSingleRiskRow
                hide={false}
                riskGroupId={riskGroupId}
                risk={risk}
                riskData={riskData}
                originHomogeneousGroupId={originHomogeneousGroupId}
                planWorkspaceIdOverride={riskData.openOrigin?.workspaceId}
              />
            </Box>
          </Box>
        </RiskCatalogDropLock>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button variant="outlined" onClick={onClose}>
            Fechar
          </Button>
        </Box>
      </SModalPaper>
    </SModal>
  );
};
