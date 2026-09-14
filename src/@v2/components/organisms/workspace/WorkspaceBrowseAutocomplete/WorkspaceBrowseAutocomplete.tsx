import { Autocomplete, Box, Chip, TextField } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
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

type WorkspaceOption = { label: string; value: string };

type WorkspaceBrowseAutocompleteBase = {
  companyId: string;
  compact?: boolean;
  /** Omits the control while loading or when a single establishment does not need switching. */
  suppressWhenNotMultiple?: boolean;
  /**
   * When true, clearing the field calls `onChange('')` / `onChange([])`
   * instead of forcing the first establishment.
   * Used on the organogram page to mean “all establishments”.
   */
  allowEmptyWorkspace?: boolean;
  mb?: number;
};

export type WorkspaceBrowseAutocompleteProps = WorkspaceBrowseAutocompleteBase &
  (
    | {
        multiple?: false;
        workspaceId?: string;
        onChange: (workspaceId: string) => void;
      }
    | {
        multiple: true;
        workspaceIds?: string[];
        onChange: (workspaceIds: string[]) => void;
      }
  );

export function WorkspaceBrowseAutocomplete(
  props: WorkspaceBrowseAutocompleteProps,
) {
  const {
    companyId,
    compact = false,
    suppressWhenNotMultiple = false,
    allowEmptyWorkspace = false,
    mb,
  } = props;
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

  const listMaxHeightPx = getHeaderChipListMaxHeightPx(options.length);

  const listSx = compact
    ? headerChipCompactListSx(listMaxHeightPx)
    : headerChipDefaultListSx(listMaxHeightPx);

  const autocomplete = props.multiple ? (
    <HierarchyWorkspaceMultiAutocomplete
      options={options}
      workspaceIds={props.workspaceIds}
      onChange={props.onChange}
      compact={compact}
      allowEmptyWorkspace={allowEmptyWorkspace}
      loading={isLoadingAllWorkspaces}
      listMaxHeightPx={listMaxHeightPx}
      listSx={listSx}
    />
  ) : (
    <SAutocompleteSelect
      isOptionEqualToValue={(a, b) => a.value === b.value}
      ListboxProps={{
        style: { maxHeight: listMaxHeightPx },
        sx: listSx,
      }}
      componentsProps={
        compact ? headerChipCompactPaperComponentsProps(listMaxHeightPx) : undefined
      }
      label={compact ? '' : 'Estabelecimento'}
      placeholder={
        compact
          ? props.workspaceId
            ? ''
            : 'Selecione o estabelecimento'
          : 'Digite para buscar por nome...'
      }
      options={options}
      value={
        props.workspaceId
          ? options.find((o) => o.value === props.workspaceId) ?? null
          : null
      }
      getOptionLabel={(o) => o.label}
      onChange={(_, option) => {
        if (option) props.onChange(option.value);
        else if (allowEmptyWorkspace) props.onChange('');
        else if (options[0]) props.onChange(options[0].value);
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

function HierarchyWorkspaceMultiAutocomplete({
  options,
  workspaceIds,
  onChange,
  compact,
  allowEmptyWorkspace,
  loading,
  listMaxHeightPx,
  listSx,
}: {
  options: WorkspaceOption[];
  workspaceIds?: string[];
  onChange: (workspaceIds: string[]) => void;
  compact: boolean;
  allowEmptyWorkspace: boolean;
  loading: boolean;
  listMaxHeightPx: number;
  listSx: SxProps<Theme>;
}) {
  const selected = (workspaceIds || [])
    .map((id) => options.find((option) => option.value === id))
    .filter((option): option is WorkspaceOption => !!option);

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      limitTags={1}
      options={options}
      value={selected}
      loading={loading}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      getOptionLabel={(option) => option.label}
      noOptionsText="Sem opções"
      onChange={(_, value) => {
        if (value.length > 0) {
          onChange(value.map((option) => option.value));
          return;
        }
        if (allowEmptyWorkspace) onChange([]);
        else if (options[0]) onChange([options[0].value]);
      }}
      ListboxProps={{
        style: { maxHeight: listMaxHeightPx },
        sx: listSx,
      }}
      componentsProps={
        compact ? headerChipCompactPaperComponentsProps(listMaxHeightPx) : undefined
      }
      ChipProps={{ size: 'small' }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip key={key} size="small" label={option.label} {...tagProps} />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          hiddenLabel={compact}
          label={compact ? undefined : 'Estabelecimentos'}
          placeholder={
            compact
              ? selected.length
                ? ''
                : 'Toda a empresa'
              : 'Digite para buscar por nome...'
          }
          sx={
            compact
              ? {
                  ...headerChipCompactInputProps.sx,
                  '& .MuiOutlinedInput-root': {
                    maxHeight: 'none',
                    minHeight: 24,
                    height: 'auto',
                    flexWrap: 'nowrap',
                    overflow: 'hidden',
                    py: '1px',
                    pr: '22px !important',
                    pl: '6px !important',
                    bgcolor: 'transparent',
                  },
                  '& fieldset': { border: 'none' },
                  '& .MuiChip-root': {
                    height: 18,
                    maxWidth: 148,
                    fontSize: 10,
                  },
                  '& .MuiChip-label': {
                    px: 0.75,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }
              : undefined
          }
        />
      )}
      sx={compact ? headerChipCompactAutocompleteSx : undefined}
    />
  );
}
