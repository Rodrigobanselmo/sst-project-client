import { Box } from '@mui/material';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { useFetchBrowseFormApplication } from '@v2/services/forms/form-application/browse-form-application/hooks/useFetchBrowseFormApplication';
import { useMemo } from 'react';

export type FormApplicationBrowseAutocompleteProps = {
  companyId: string;
  value?: string | null;
  onChange: (formApplicationId: string | null) => void;
  /** Quando false, o fetch não dispara (ex.: modal de outro tipo documental). */
  enabled?: boolean;
  mb?: number;
};

/**
 * Seletor de aplicações psicossociais (COPSOQ / FRPS) por empresa.
 * Filtra PSYCHOSOCIAL no client até o browse aceitar type server-side.
 */
export function FormApplicationBrowseAutocomplete({
  companyId,
  value,
  onChange,
  enabled = true,
  mb,
}: FormApplicationBrowseAutocompleteProps) {
  const { formApplication, isLoading } = useFetchBrowseFormApplication(
    {
      companyId,
      pagination: { page: 1, limit: 50 },
    },
    { enabled: Boolean(companyId) && enabled },
  );

  const options = useMemo(() => {
    const results = formApplication?.results ?? [];
    return results
      .filter((item) => item.form?.type === FormTypeEnum.PSYCHOSOCIAL)
      .map((item) => ({
        label: item.name,
        value: item.id,
        secondary: item.form?.name,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }),
      );
  }, [formApplication?.results]);

  const selected =
    value && options.length
      ? options.find((option) => option.value === value) ?? null
      : null;

  return (
    <Box mb={mb}>
      <SAutocompleteSelect
        isOptionEqualToValue={(a, b) => a.value === b.value}
        label="Aplicação do formulário (participação FRPS)"
        placeholder="selecione a aplicação psicossocial vinculada..."
        options={options}
        value={selected}
        getOptionLabel={(o) =>
          o.secondary ? `${o.label} (${o.secondary})` : o.label
        }
        onChange={(_, option) => onChange(option?.value ?? null)}
        loading={isLoading}
      />
    </Box>
  );
}
