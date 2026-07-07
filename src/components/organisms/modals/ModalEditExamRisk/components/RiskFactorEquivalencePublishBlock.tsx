import { FC, useEffect, useMemo, useState } from 'react';

import { Autocomplete, Box, TextField } from '@mui/material';
import SSelect from 'components/atoms/SSelect';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { useFetchBrowseRiskFactorEquivalences } from '@v2/services/risk-factor-equivalence/hooks/useFetchBrowseRiskFactorEquivalences';
import { useFetchSearchSystemRisks } from '@v2/services/risk-factor-equivalence/hooks/useFetchSearchSystemRisks';
import type {
  RiskFactorEquivalenceType,
  SystemRiskSearchItem,
} from '@v2/services/risk-factor-equivalence/risk-factor-equivalence.types';
import type { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { isNonSystemRisk } from '../utils/risk-system-flag.util';

type Props = {
  companyId?: string;
  risk?: IRiskFactors;
  publishAsSystemRule: boolean;
  equivalenceType: RiskFactorEquivalenceType;
  selectedCanonicalRisk?: SystemRiskSearchItem | null;
  onEquivalenceTypeChange: (value: RiskFactorEquivalenceType) => void;
  onCanonicalRiskChange: (risk: SystemRiskSearchItem | null) => void;
  onExistingEquivalenceChange: (
    equivalence: { canonicalRiskId: string; canonicalLabel: string } | null,
  ) => void;
};

const equivalenceTypeOptions = [
  {
    value: 'SEMANTIC_ALIAS',
    content: 'Alias semântico (mesmo risco, nome diferente)',
  },
  {
    value: 'TECHNICAL_DUPLICATE',
    content: 'Duplicata técnica',
  },
];

export const RiskFactorEquivalencePublishBlock: FC<Props> = ({
  companyId,
  risk,
  publishAsSystemRule,
  equivalenceType,
  selectedCanonicalRisk,
  onEquivalenceTypeChange,
  onCanonicalRiskChange,
  onExistingEquivalenceChange,
}) => {
  const [search, setSearch] = useState(risk?.name || '');

  const shouldShow =
    publishAsSystemRule && Boolean(risk?.id) && isNonSystemRisk(risk);

  const { data: equivalences = [], isLoading: loadingEquivalence } =
    useFetchBrowseRiskFactorEquivalences({
      companyId,
      aliasRiskId: risk?.id,
      enabled: shouldShow,
    });

  const activeEquivalence = equivalences.find((item) => !item.revokedAt);

  const { data: systemRisks = [], isLoading: loadingSystemRisks } =
    useFetchSearchSystemRisks({
      search,
      type: risk?.type,
      enabled: shouldShow && !activeEquivalence,
    });

  const selectedOption = useMemo(
    () =>
      selectedCanonicalRisk
        ? systemRisks.find((item) => item.id === selectedCanonicalRisk.id) ||
          selectedCanonicalRisk
        : null,
    [selectedCanonicalRisk, systemRisks],
  );

  useEffect(() => {
    if (!shouldShow) return;

    if (activeEquivalence) {
      onExistingEquivalenceChange({
        canonicalRiskId: activeEquivalence.canonicalRiskId,
        canonicalLabel: activeEquivalence.canonicalLabel,
      });
      onCanonicalRiskChange({
        id: activeEquivalence.canonicalRiskId,
        name: activeEquivalence.canonicalLabel,
        type: risk?.type || '',
        cas: null,
        esocialCode: null,
        system: true,
      });
      return;
    }

    onExistingEquivalenceChange(null);
    // Callbacks vêm do parent inline; incluí-los nas deps causa loop de render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldShow,
    activeEquivalence?.id,
    activeEquivalence?.canonicalRiskId,
    activeEquivalence?.canonicalLabel,
    risk?.type,
  ]);

  useEffect(() => {
    setSearch(risk?.name || '');
  }, [risk?.id, risk?.name]);

  if (!shouldShow) return null;

  return (
    <Box
      mt={3}
      p={3}
      sx={{
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 1,
        bgcolor: 'grey.50',
      }}
    >
      <SText fontSize={13} fontWeight={600} mb={1}>
        Este risco não pertence ao catálogo SimpleSST.
      </SText>
      <SText fontSize={12} color="text.light" mb={3}>
        Para publicar como padrão da Biblioteca, vincule-o a um fator de risco
        do catálogo.
      </SText>

      {loadingEquivalence ? (
        <SText fontSize={12} color="text.light">
          Verificando equivalência existente...
        </SText>
      ) : activeEquivalence ? (
        <SText fontSize={12}>
          Este risco já está vinculado ao catálogo SimpleSST:{' '}
          <strong>{activeEquivalence.canonicalLabel}</strong>
        </SText>
      ) : (
        <SFlex direction="column" gap={3}>
          <Box>
            <SText fontSize={12} color="text.label" mb={2}>
              Fator de risco do catálogo SimpleSST
            </SText>
            <Autocomplete
              options={systemRisks}
              loading={loadingSystemRisks}
              value={selectedOption}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onInputChange={(_, value) => setSearch(value)}
              onChange={(_, option) => onCanonicalRiskChange(option)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Buscar risco do catálogo..."
                />
              )}
            />
          </Box>

          <Box maxWidth={420}>
            <SSelect
              label="Tipo de equivalência"
              labelPosition="top"
              size="small"
              value={equivalenceType ?? 'SEMANTIC_ALIAS'}
              onChange={(event) =>
                onEquivalenceTypeChange(
                  event.target.value as RiskFactorEquivalenceType,
                )
              }
              options={equivalenceTypeOptions}
            />
          </Box>
        </SFlex>
      )}
    </Box>
  );
};
