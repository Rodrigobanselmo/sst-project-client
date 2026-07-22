import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { FrpsLibraryFilterOptions } from '@v2/services/forms/frps-explainability-library';

import type { FrpsLibraryUrlFilters } from '../frps-explainability-library-filters.util';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'NEVER_GENERATED', label: 'Nunca gerado' },
  { value: 'DRAFT_AI', label: 'Rascunho' },
  { value: 'VALIDATED', label: 'Validado' },
  { value: 'REJECTED', label: 'Rejeitado' },
] as const;

const KIND_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'SOURCE', label: 'Fontes' },
  { value: 'RECOMMENDATION', label: 'Recomendações' },
] as const;

type Props = {
  filters: FrpsLibraryUrlFilters;
  filterOptions?: FrpsLibraryFilterOptions;
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onSearchCommit: () => void;
  onFiltersChange: (next: FrpsLibraryUrlFilters) => void;
  onGeneralCatalog: () => void;
  onRestoreDefaultScope: () => void;
};

export function FrpsExplainabilityLibraryFiltersBar({
  filters,
  filterOptions,
  searchDraft,
  onSearchDraftChange,
  onSearchCommit,
  onFiltersChange,
  onGeneralCatalog,
  onRestoreDefaultScope,
}: Props) {
  const subtypes = (filterOptions?.subtypes ?? []).filter((subtype) =>
    filters.riskType ? subtype.riskType === filters.riskType : true,
  );
  const risks = (filterOptions?.risks ?? []).filter((risk) => {
    if (filters.riskType && risk.riskType !== filters.riskType) return false;
    if (
      filters.riskSubTypeId != null &&
      !risk.subTypeIds.includes(filters.riskSubTypeId)
    ) {
      return false;
    }
    if (filters.riskSubTypeEnum) {
      const subtype = filterOptions?.subtypes.find(
        (item) => item.subTypeEnum === filters.riskSubTypeEnum,
      );
      if (subtype && !risk.subTypeIds.includes(subtype.id)) return false;
    }
    return true;
  });

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={1.25}
      alignItems="center"
      mb={2}
    >
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Categoria</InputLabel>
        <Select
          label="Categoria"
          value={filters.riskType || ''}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              riskType: event.target.value || null,
              riskSubTypeEnum: null,
              riskSubTypeId: null,
              riskId: null,
              generalCatalog: false,
              page: 1,
            })
          }
        >
          <MenuItem value="">Todas</MenuItem>
          {(filterOptions?.categories ?? []).map((category) => (
            <MenuItem key={category.value} value={category.value}>
              {category.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 170 }}>
        <InputLabel>Subtipo</InputLabel>
        <Select
          label="Subtipo"
          value={filters.riskSubTypeEnum || ''}
          onChange={(event) => {
            const value = event.target.value || null;
            const match = subtypes.find((item) => item.subTypeEnum === value);
            onFiltersChange({
              ...filters,
              riskSubTypeEnum: value,
              riskSubTypeId: match?.id ?? null,
              riskId: null,
              generalCatalog: false,
              page: 1,
            });
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {subtypes.map((subtype) => (
            <MenuItem
              key={subtype.id}
              value={subtype.subTypeEnum || String(subtype.id)}
            >
              {subtype.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel>Fator</InputLabel>
        <Select
          label="Fator"
          value={filters.riskId || ''}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              riskId: event.target.value || null,
              generalCatalog: false,
              page: 1,
            })
          }
        >
          <MenuItem value="">Todos</MenuItem>
          {risks.map((risk) => (
            <MenuItem key={risk.id} value={risk.id}>
              {risk.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Tipo</InputLabel>
        <Select
          label="Tipo"
          value={filters.kind || ''}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              kind: (event.target.value || null) as FrpsLibraryUrlFilters['kind'],
              page: 1,
            })
          }
        >
          {KIND_OPTIONS.map((option) => (
            <MenuItem key={option.label} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={filters.status || ''}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              status: (event.target.value ||
                null) as FrpsLibraryUrlFilters['status'],
              page: 1,
            })
          }
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.label} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        label="Busca"
        value={searchDraft}
        onChange={(event) => onSearchDraftChange(event.target.value)}
        onBlur={onSearchCommit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSearchCommit();
        }}
        sx={{ minWidth: 220 }}
      />

      <Button
        size="small"
        variant={filters.generalCatalog ? 'contained' : 'outlined'}
        onClick={onGeneralCatalog}
      >
        Catálogo geral
      </Button>
      <Button size="small" variant="text" onClick={onRestoreDefaultScope}>
        Psicossocial
      </Button>
    </Box>
  );
}
