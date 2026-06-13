import { Box, Chip } from '@mui/material';

import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import SText from 'components/atoms/SText';

import { ConsolidatedRiskFactorGroup } from './consolidated-risk-analysis.utils';
import { ConsolidatedRiskSectorCard } from './ConsolidatedRiskSectorCard';

type Props = {
  group: ConsolidatedRiskFactorGroup;
  defaultExpanded?: boolean;
};

export function ConsolidatedRiskFactorAccordion({
  group,
  defaultExpanded = false,
}: Props) {
  const riskType = group.riskType as RiskTypeEnum;

  return (
    <SAccordion
      defaultExpanded={defaultExpanded}
      title={
        <SFlex alignItems="center" gap={1} flexWrap="wrap">
          <SRiskChip type={riskType} size="md" />
          <SText fontSize={15} fontWeight={700}>
            {group.riskFactor}
          </SText>
        </SFlex>
      }
      subtitle={
        <SFlex gap={0.75} flexWrap="wrap" mt={0.5}>
          <Chip
            size="small"
            variant="outlined"
            label={`${group.stats.totalEntries} registros`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`${group.stats.totalCompanies} empresas`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`${group.stats.totalSectors} setores/unidades`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`${group.stats.totalAiAnalyses} análises IA`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`Maior NRO: ${group.stats.highestNro}`}
          />
          {group.riskCategory && (
            <Chip size="small" variant="outlined" label={group.riskCategory} />
          )}
        </SFlex>
      }
    >
      <SAccordionBody>
        {group.stats.nroDistribution.length > 1 && (
          <Box mb={2}>
            <SText fontSize={12} color="text.secondary" mb={0.75}>
              Distribuição por NRO (valores já existentes):
            </SText>
            <SFlex gap={0.75} flexWrap="wrap">
              {group.stats.nroDistribution.map((entry) => (
                <Chip
                  key={entry.label}
                  size="small"
                  label={`${entry.label}: ${entry.count}`}
                  variant="outlined"
                />
              ))}
            </SFlex>
          </Box>
        )}

        <SFlex direction="column" gap={2}>
          {group.entries.map((item) => (
            <ConsolidatedRiskSectorCard key={item.id} item={item} />
          ))}
        </SFlex>
      </SAccordionBody>
    </SAccordion>
  );
}
