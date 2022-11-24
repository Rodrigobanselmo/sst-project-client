/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { SelectForm } from 'components/molecules/form/select';
import { ProtocolSelect } from 'components/organisms/tagSelects/ProtocolSelect';
import { RiskSelect } from 'components/organisms/tagSelects/RiskSelect';

import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { isQuantity } from 'core/utils/helpers/isQuantity';

import { IUseEditProtocol } from '../../hooks/useEditProtocols';

export const ModalProtocolStep = ({
  protocolData,
  control,
  setProtocolData,
}: IUseEditProtocol) => {
  return (
    <SFlex direction="column" mt={8}>
      <SFlex gap={5} mt={10} direction="column" flexWrap="wrap">
        <Box flex={1}>
          <SText color="text.label" fontSize={14} mb={3}>
            Fator de Risco
          </SText>
          <RiskSelect
            sx={{ minWidth: '100%' }}
            large
            error={protocolData.error.risk}
            tooltipTitle={protocolData.risk?.name || ''}
            borderActive={protocolData.risk?.id ? 'info' : undefined}
            handleSelect={(option: any) =>
              option.id &&
              setProtocolData({
                ...protocolData,
                error: { ...protocolData.error, risk: false },
                risk: option,
                riskId: option.id,
              })
            }
            text={protocolData.risk?.name || 'selecione um risco'}
            multiple={false}
          />
        </Box>
        <Box flex={1}>
          <SText color="text.label" fontSize={14} mb={3}>
            Protocolo
          </SText>
          <ProtocolSelect
            sx={{ minWidth: '100%' }}
            asyncLoad
            large
            text={protocolData.protocol?.name || 'selecione um protocolo'}
            error={protocolData.error.protocol}
            tooltipTitle={protocolData.protocol?.name || ''}
            multiple={false}
            onlyProtocol
            borderActive={protocolData.protocol?.id ? 'info' : undefined}
            handleSelect={(option: any) =>
              option?.id &&
              setProtocolData({
                ...protocolData,
                error: { ...protocolData.error, protocol: false },
                protocol: option,
                protocolId: option.id,
              })
            }
          />
        </Box>
      </SFlex>

      <SText color="text.label" fontSize={14} mb={3} mt={5}>
        Grau de risco mínimo
      </SText>
      <SFlex gap={5} mt={2} maxWidth={400} flexWrap="wrap">
        <Box flex={1} width={200}>
          <SelectForm
            defaultValue={String(protocolData.minRiskDegree || 1)}
            label="Qualitativo"
            control={control}
            placeholder="grau de risco..."
            name="minRiskDegree"
            labelPosition="center"
            size="small"
            options={Object.values(matrixRiskMap)
              .filter((m) => m.level > 0 && m.level < 6)
              .map((value) => ({
                value: value.level,
                content: value.label,
              }))}
          />
        </Box>
        <Box flex={1} maxWidth={200}>
          {isQuantity(protocolData.risk) && (
            <SelectForm
              fullWidth
              defaultValue={String(protocolData.minRiskDegreeQuantity || 1)}
              label="Quantitativo"
              control={control}
              placeholder="grau de risco..."
              name="minRiskDegreeQuantity"
              labelPosition="center"
              size="small"
              options={Object.values(matrixRiskMap)
                .filter((m) => m.level > 0 && m.level < 6)
                .map((value) => ({
                  value: value.level,
                  content: value.label,
                }))}
            />
          )}
        </Box>
      </SFlex>
    </SFlex>
  );
};
