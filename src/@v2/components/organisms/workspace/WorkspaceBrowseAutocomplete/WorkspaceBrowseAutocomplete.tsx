import { Box } from '@mui/material';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';
import {
  getHeaderChipListMaxHeightPx,
  headerChipCompactAutocompleteSx,
  headerChipCompactInputProps,
  headerChipCompactListSx,
  headerChipCompactPaperComponentsProps,
  headerChipDefaultListSx,
} from '@v2/components/organisms/workspace/documentsHeaderChipSelectPreset';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useMemo } from 'react';

export type WorkspaceBrowseAutocompleteProps = {
  companyId: string;
  workspaceId?: string;
  onChange: (workspaceId: string) => void;
  compact?: boolean;
  /** Omits the control while loading or when a single establishment does not need switching. */
  suppressWhenNotMultiple?: boolean;
  /**
   * When true, clearing the field calls `onChange('')` instead of forcing the first establishment.
   * Used on the organogram page to mean “all establishments”.
   */
  allowEmptyWorkspace?: boolean;
  mb?: number;
};

export function WorkspaceBrowseAutocomplete({
  companyId,
  workspaceId,
  onChange,
  compact = false,
  suppressWhenNotMultiple = false,
  allowEmptyWorkspace = false,
  mb,
}: WorkspaceBrowseAutocompleteProps) {
  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });

  const workspaceList = useMemo(() => {
    if (!workspaces?.results?.length) return [];
    return [...workspaces.results].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
    );
  }, [workspaces?.results]);

  const options = useMemo(
    () => workspaceList.map((w) => ({ label: w.name, value: w.id })),
    [workspaceList],
  );

  if (suppressWhenNotMultiple) {
    if (isLoadingAllWorkspaces) return null;
    if (!workspaces?.results?.length || workspaces.results.length <= 1) {
      return null;
    }
  }

  if (!isLoadingAllWorkspaces && !workspaces?.results?.length) return null;

  const value = workspaceId
    ? options.find((o) => o.value === workspaceId) ?? null
    : null;

  const listMaxHeightPx = getHeaderChipListMaxHeightPx(options.length);

  const listSx = compact
    ? headerChipCompactListSx(listMaxHeightPx)
    : headerChipDefaultListSx(listMaxHeightPx);

  const autocomplete = (
    <SAutocompleteSelect
      isOptionEqualToValue={(a, b) => a.value === b.value}
      ListboxProps={{
        style: { maxHeight: listMaxHeightPx },
        sx: listSx,
      }}
      componentsProps={compact ? headerChipCompactPaperComponentsProps : undefined}
      label={compact ? '' : 'Estabelecimento'}
      placeholder={
        compact
          ? value
            ? ''
            : 'Selecione o estabelecimento'
          : 'Digite para buscar por nome...'
      }
      options={options}
      value={value}
      getOptionLabel={(o) => o.label}
      onChange={(_, option) => {
        if (option) onChange(option.value);
        else if (allowEmptyWorkspace) onChange('');
        else if (options[0]) onChange(options[0].value);
      }}
      loading={isLoadingAllWorkspaces}
      inputProps={compact ? headerChipCompactInputProps : undefined}
      sx={compact ? headerChipCompactAutocompleteSx : undefined}
    />
  );

  if (compact) {
    return (
      <Box sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: '100%' }}>
        {autocomplete}
      </Box>
    );
  }

  return <Box mb={mb}>{autocomplete}</Box>;
}
