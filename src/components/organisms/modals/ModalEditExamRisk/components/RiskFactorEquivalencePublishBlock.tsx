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
import {
  findExactCanonicalSuggestion,
  isCatalogSystemRisk,
  isExplicitNonSystemRisk,
  isRiskIdInSystemSearchResults,
} from '../utils/risk-system-flag.util';

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
  onCatalogRiskResolved?: (isCatalog: boolean) => void;
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
  onCatalogRiskResolved,
}) => {
  const [search, setSearch] = useState(risk?.name || '');

  const isExplicitCatalog = isCatalogSystemRisk(risk);
  const needsCatalogProbe =
    publishAsSystemRule && Boolean(risk?.id) && !isExplicitCatalog;

  const shouldFetchSystemRisks =
    publishAsSystemRule && Boolean(risk?.id) && !isExplicitCatalog;

  const { data: systemRisks = [], isLoading: loadingSystemRisks } =
    useFetchSearchSystemRisks({
      search,
      type: risk?.type,
      enabled: shouldFetchSystemRisks,
    });

  const catalogViaSearch = useMemo(
    () => isRiskIdInSystemSearchResults(risk?.id, systemRisks),
    [risk?.id, systemRisks],
  );

  const isCatalogRisk = isExplicitCatalog || catalogViaSearch;

  const shouldShowEquivalenceBlock =
    publishAsSystemRule &&
    Boolean(risk?.id) &&
    !isCatalogRisk &&
    (isExplicitNonSystemRisk(risk) ||
      (needsCatalogProbe && !loadingSystemRisks));

  const { data: equivalences = [], isLoading: loadingEquivalence } =
    useFetchBrowseRiskFactorEquivalences({
      companyId,
      aliasRiskId: risk?.id,
      enabled: shouldShowEquivalenceBlock,
    });

  const activeEquivalence = equivalences.find((item) => !item.revokedAt);

  const exactCanonicalSuggestion = useMemo(
    () =>
      shouldShowEquivalenceBlock && !activeEquivalence
        ? findExactCanonicalSuggestion(risk, systemRisks)
        : null,
    [activeEquivalence, risk, shouldShowEquivalenceBlock, systemRisks],
  );

  const selectedOption = useMemo(
    () =>
      selectedCanonicalRisk
        ? systemRisks.find((item) => item.id === selectedCanonicalRisk.id) ||
          selectedCanonicalRisk
        : null,
    [selectedCanonicalRisk, systemRisks],
  );

  const hasExactAliasSuggestion = Boolean(exactCanonicalSuggestion);

  useEffect(() => {
    if (!publishAsSystemRule || !risk?.id) {
      onCatalogRiskResolved?.(false);
      return;
    }

    if (isExplicitCatalog) {
      onCatalogRiskResolved?.(true);
      return;
    }

    if (needsCatalogProbe && !loadingSystemRisks) {
      onCatalogRiskResolved?.(catalogViaSearch);
    }
    // onCatalogRiskResolved vem inline do parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    publishAsSystemRule,
    risk?.id,
    isExplicitCatalog,
    catalogViaSearch,
    loadingSystemRisks,
    needsCatalogProbe,
  ]);

  useEffect(() => {
    if (!shouldShowEquivalenceBlock) return;

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
    shouldShowEquivalenceBlock,
    activeEquivalence?.id,
    activeEquivalence?.canonicalRiskId,
    activeEquivalence?.canonicalLabel,
    risk?.type,
  ]);

  useEffect(() => {
    if (
      !shouldShowEquivalenceBlock ||
      activeEquivalence ||
      selectedCanonicalRisk ||
      !exactCanonicalSuggestion
    ) {
      return;
    }

    onCanonicalRiskChange(exactCanonicalSuggestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldShowEquivalenceBlock,
    exactCanonicalSuggestion?.id,
    activeEquivalence?.id,
    selectedCanonicalRisk?.id,
  ]);

  useEffect(() => {
    setSearch(risk?.name || '');
  }, [risk?.id, risk?.name]);

  if (!publishAsSystemRule || !risk?.id) return null;

  if (needsCatalogProbe && loadingSystemRisks) {
    return (
      <SText fontSize={12} color="text.light" mt={3}>
        Verificando fator no catálogo SimpleSST...
      </SText>
    );
  }

  if (isCatalogRisk) {
    return (
      <Box
        mt={3}
        p={2}
        sx={{
          border: '1px solid',
          borderColor: 'success.light',
          borderRadius: 1,
          bgcolor: 'success.50',
        }}
      >
        <SText fontSize={12}>
          Este vínculo já usa um fator do catálogo SimpleSST. A publicação na
          Biblioteca usará este fator diretamente.
        </SText>
      </Box>
    );
  }

  if (!shouldShowEquivalenceBlock) return null;

  const title = hasExactAliasSuggestion
    ? 'Este vínculo usa uma cópia/alias de um fator do catálogo SimpleSST.'
    : 'Para publicar na Biblioteca, vincule este fator ao catálogo SimpleSST.';

  const subtitle = hasExactAliasSuggestion
    ? 'Confirme o fator oficial para publicar na Biblioteca.'
    : 'Selecione o fator de risco oficial do catálogo SimpleSST.';

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
        {title}
      </SText>
      <SText fontSize={12} color="text.light" mb={3}>
        {subtitle}
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
