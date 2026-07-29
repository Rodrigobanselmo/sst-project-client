import { Box } from '@mui/material';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetchBrowseFormApplication } from '@v2/services/forms/form-application/browse-form-application/hooks/useFetchBrowseFormApplication';
import { readFormApplication } from '@v2/services/forms/form-application/read-form-application/service/read-form-application.service';
import { useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import {
  FormApplicationOption,
  FormApplicationPickerStatus,
  mergeHydratedFormApplicationOption,
  resolveSelectedFormApplicationOption,
} from './form-application-binding.util';

export type FormApplicationBrowseAutocompleteProps = {
  companyId: string;
  value?: string | null;
  onChange: (formApplicationId: string | null) => void;
  /** Quando false, o fetch não dispara (ex.: modal de outro tipo documental). */
  enabled?: boolean;
  mb?: number;
  /** Notifica loading / ready / error para bloquear submit com vínculo invisível. */
  onStatusChange?: (status: FormApplicationPickerStatus) => void;
};

/**
 * Seletor de aplicações psicossociais (COPSOQ / FRPS) por empresa.
 * Filtra PSYCHOSOCIAL no server; busca por texto; hidrata o valor congelado via read-by-id.
 */
export function FormApplicationBrowseAutocomplete({
  companyId,
  value,
  onChange,
  enabled = true,
  mb,
  onStatusChange,
}: FormApplicationBrowseAutocompleteProps) {
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const setSearchDebounced = useDebouncedCallback((next: string) => {
    setDebouncedSearch(next.trim());
  }, 400);

  const browseEnabled = Boolean(companyId) && enabled;

  const {
    formApplication,
    isLoading: isBrowseLoading,
    isError: isBrowseError,
    isFetching: isBrowseFetching,
  } = useFetchBrowseFormApplication(
    {
      companyId,
      pagination: { page: 1, limit: 50 },
      filters: {
        search: debouncedSearch || undefined,
        types: [FormTypeEnum.PSYCHOSOCIAL],
      },
    },
    { enabled: browseEnabled },
  );

  const browseOptions = useMemo<FormApplicationOption[]>(() => {
    const results = formApplication?.results ?? [];
    return results
      .map((item) => ({
        label: item.name,
        value: item.id,
        secondary: item.form?.name,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }),
      );
  }, [formApplication?.results]);

  const valueInBrowse = Boolean(
    value && browseOptions.some((option) => option.value === value),
  );

  const shouldHydrate =
    browseEnabled &&
    Boolean(value) &&
    !isBrowseLoading &&
    !isBrowseError &&
    !valueInBrowse;

  const {
    data: hydratedApplication,
    isLoading: isHydrateLoading,
    isError: isHydrateError,
    isFetching: isHydrateFetching,
  } = useFetch({
    queryFn: async () =>
      readFormApplication({
        companyId,
        applicationId: value as string,
      }),
    queryKey: [
      QueryKeyFormEnum.FORM_APPLICATION,
      companyId,
      value,
      'hydrate-frps-binding',
    ],
    enabled: shouldHydrate,
  });

  const hydratedOption = useMemo<FormApplicationOption | null>(() => {
    if (!hydratedApplication || hydratedApplication.id !== value) {
      return null;
    }
    if (hydratedApplication.form?.type !== FormTypeEnum.PSYCHOSOCIAL) {
      return null;
    }
    return {
      label: hydratedApplication.name,
      value: hydratedApplication.id,
      secondary: hydratedApplication.form?.name,
    };
  }, [hydratedApplication, value]);

  const options = useMemo(
    () => mergeHydratedFormApplicationOption(browseOptions, hydratedOption),
    [browseOptions, hydratedOption],
  );

  const selected = resolveSelectedFormApplicationOption(value, options);

  const status: FormApplicationPickerStatus = useMemo(() => {
    if (!browseEnabled) return 'idle';
    if (!value) {
      if (isBrowseLoading || isBrowseFetching) return 'loading';
      if (isBrowseError) return 'error';
      return 'ready';
    }
    if (isBrowseLoading) return 'loading';
    if (isBrowseError) return 'error';
    if (selected) return 'ready';
    if (shouldHydrate && (isHydrateLoading || isHydrateFetching)) {
      return 'loading';
    }
    if (
      shouldHydrate &&
      (isHydrateError || (!isHydrateLoading && !isHydrateFetching && !hydratedOption))
    ) {
      return 'error';
    }
    if (!selected) return 'error';
    return 'ready';
  }, [
    browseEnabled,
    value,
    isBrowseLoading,
    isBrowseFetching,
    isBrowseError,
    selected,
    shouldHydrate,
    isHydrateLoading,
    isHydrateFetching,
    isHydrateError,
    hydratedOption,
  ]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  const errorMessage =
    status === 'error'
      ? isBrowseError
        ? 'Não foi possível carregar as aplicações psicossociais.'
        : 'Não foi possível carregar a aplicação vinculada a esta versão.'
      : undefined;

  return (
    <Box mb={mb}>
      <SAutocompleteSelect
        isOptionEqualToValue={(a, b) => a.value === b.value}
        label="Aplicação do formulário (FRPS / COPSOQ III)"
        placeholder="digite para pesquisar a aplicação psicossocial..."
        options={options}
        value={selected}
        getOptionLabel={(o) =>
          o.secondary ? `${o.label} (${o.secondary})` : o.label
        }
        onChange={(_, option) => onChange(option?.value ?? null)}
        onInputChange={(_, next, reason) => {
          if (reason === 'input' || reason === 'clear') {
            setSearchDebounced(next);
          }
        }}
        loading={status === 'loading'}
        errorMessage={errorMessage}
      />
    </Box>
  );
}
