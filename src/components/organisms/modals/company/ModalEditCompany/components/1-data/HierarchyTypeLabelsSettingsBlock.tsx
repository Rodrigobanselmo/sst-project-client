import React, { useEffect, useMemo, useState } from 'react';

import { Box, Button, Chip, TextField } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import {
  applyHierarchyTypeLabelsPatchToMetadata,
  buildHierarchyTypeLabelsPatch,
  createHierarchyTypeLabelsDraft,
  isHierarchyTypeLabelCustom,
  isHierarchyTypeLabelsDraftDirty,
  type HierarchyTypeLabelsDraft,
} from 'core/constants/maps/hierarchy-type-labels-form.util';
import {
  CANONICAL_HIERARCHY_TYPE_LABELS,
  HIERARCHY_TYPE_LABEL_KEYS,
} from 'core/constants/maps/hierarchy-type-labels';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import type {
  ICompanyHierarchyTypeLabels,
  ICompanyMetadata,
} from 'core/interfaces/api/ICompany';
import { useMutUpdateHierarchyTypeLabels } from 'core/services/hooks/mutations/manager/company/useMutUpdateHierarchyTypeLabels';

type Props = {
  companyId?: string;
  storedLabels?: ICompanyHierarchyTypeLabels;
  metadata?: ICompanyMetadata;
  onSaved?: (metadata: ICompanyMetadata) => void;
};

export function HierarchyTypeLabelsSettingsBlock({
  companyId,
  storedLabels,
  metadata,
  onSaved,
}: Props) {
  const mutation = useMutUpdateHierarchyTypeLabels();
  const [draft, setDraft] = useState<HierarchyTypeLabelsDraft>(() =>
    createHierarchyTypeLabelsDraft(storedLabels),
  );

  useEffect(() => {
    setDraft(createHierarchyTypeLabelsDraft(storedLabels));
  }, [storedLabels]);

  const dirty = useMemo(
    () =>
      isHierarchyTypeLabelsDraftDirty({
        stored: storedLabels,
        draft,
      }),
    [draft, storedLabels],
  );

  const handleChange = (type: HierarchyEnum, value: string) => {
    setDraft((current) => ({ ...current, [type]: value }));
  };

  const handleRestore = (type: HierarchyEnum) => {
    setDraft((current) => ({
      ...current,
      [type]: CANONICAL_HIERARCHY_TYPE_LABELS[type],
    }));
  };

  const handleSave = async () => {
    if (!companyId || !dirty) return;

    const payload = buildHierarchyTypeLabelsPatch({
      stored: storedLabels,
      draft,
    });

    const result = await mutation.mutateAsync({
      companyId,
      hierarchyTypeLabels: payload.hierarchyTypeLabels,
    });

    if (!result) return;

    onSaved?.(
      applyHierarchyTypeLabelsPatchToMetadata(
        metadata,
        result.hierarchyTypeLabels,
      ),
    );
    setDraft(createHierarchyTypeLabelsDraft(result.hierarchyTypeLabels));
  };

  return (
    <Box mt={10} mb={2}>
      <SText mb={2} color="text.label" fontSize={14} fontWeight={600}>
        Nomenclatura da hierarquia
      </SText>
      <SText mb={5} color="text.light" fontSize={12}>
        Nomes dos tipos hierárquicos desta empresa. Não altera o nome dos nós
        já cadastrados e vale para toda a empresa, não por estabelecimento.
      </SText>

      <SFlex direction="column" gap={4}>
        {HIERARCHY_TYPE_LABEL_KEYS.map((type) => {
          const canonical = CANONICAL_HIERARCHY_TYPE_LABELS[type];
          const trimmed = draft[type].trim();
          const customValue = Boolean(trimmed) && trimmed !== canonical;
          const savedCustom = isHierarchyTypeLabelCustom(type, storedLabels);

          return (
            <SFlex key={type} gap={4} align="center" flexWrap="wrap">
              <TextField
                label={type}
                value={draft[type]}
                size="small"
                onChange={(event) => handleChange(type, event.target.value)}
                helperText={`Padrão SimpleSST: ${canonical}`}
                sx={{ minWidth: 280, flex: 1 }}
              />
              <Chip
                size="small"
                label={customValue ? 'Personalizado' : 'Padrão'}
                color={customValue ? 'warning' : 'default'}
                variant={customValue ? 'filled' : 'outlined'}
              />
              {(customValue || savedCustom) && (
                <Button
                  size="small"
                  onClick={() => handleRestore(type)}
                >
                  Restaurar padrão
                </Button>
              )}
            </SFlex>
          );
        })}
      </SFlex>

      <Button
        variant="contained"
        size="small"
        sx={{ mt: 5 }}
        disabled={!dirty || mutation.isLoading || !companyId}
        onClick={() => void handleSave()}
      >
        Salvar nomenclatura
      </Button>
    </Box>
  );
}
