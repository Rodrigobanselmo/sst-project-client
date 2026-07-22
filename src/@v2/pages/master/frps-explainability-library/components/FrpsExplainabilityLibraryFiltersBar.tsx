import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { FrpsCatalogAdminFilterOptions } from '@v2/services/forms/frps-explainability-library';

import type { FrpsLibraryUrlFilters } from '../frps-explainability-library-filters.util';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'NEVER_GENERATED', label: 'Nunca gerado' },
  { value: 'DRAFT_AI', label: 'Rascunho' },
  { value: 'VALIDATED', label: 'Validado' },
  { value: 'REJECTED', label: 'Rejeitado' },
] as const;

const CATALOG_TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'SOURCE', label: 'Fonte' },
  { value: 'ADM', label: 'Administrativa' },
  { value: 'ENG', label: 'Engenharia' },
] as const;

const ORIGIN_OPTIONS = [
  { value: 'ALL', label: 'Todas as origens' },
  { value: 'GLOBAL', label: 'Global' },
  { value: 'LOCAL', label: 'Local' },
] as const;

const TRI_STATE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Com' },
  { value: 'false', label: 'Sem' },
] as const;

type Props = {
  filters: FrpsLibraryUrlFilters;
  filterOptions?: FrpsCatalogAdminFilterOptions;
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onSearchCommit: () => void;
  onFiltersChange: (next: FrpsLibraryUrlFilters) => void;
  onGeneralCatalog: () => void;
  onRestoreDefaultScope: () => void;
};

function triStateToFilter(value: string): boolean | null {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function filterToTriState(value: boolean | null): string {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return '';
}

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
  const companies = filterOptions?.companies ?? [];

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

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Origem</InputLabel>
        <Select
          label="Origem"
          value={filters.origin}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              origin: event.target.value as FrpsLibraryUrlFilters['origin'],
              companyId:
                event.target.value === 'GLOBAL' ? null : filters.companyId,
              page: 1,
            })
          }
        >
          {ORIGIN_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Empresa</InputLabel>
        <Select
          label="Empresa"
          value={filters.companyId || ''}
          disabled={filters.origin === 'GLOBAL'}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              companyId: event.target.value || null,
              page: 1,
            })
          }
        >
          <MenuItem value="">Todas</MenuItem>
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Tipo</InputLabel>
        <Select
          label="Tipo"
          value={filters.catalogType || ''}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              catalogType: (event.target.value ||
                null) as FrpsLibraryUrlFilters['catalogType'],
              page: 1,
            })
          }
        >
          {CATALOG_TYPE_OPTIONS.map((option) => (
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

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Explicação</InputLabel>
        <Select
          label="Explicação"
          value={filterToTriState(filters.hasExplanation)}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              hasExplanation: triStateToFilter(event.target.value),
              page: 1,
            })
          }
        >
          {TRI_STATE_OPTIONS.map((option) => (
            <MenuItem key={`exp-${option.value || 'all'}`} value={option.value}>
              {option.label === 'Todos'
                ? 'Com/sem explicação'
                : `${option.label} explicação`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Equivalência</InputLabel>
        <Select
          label="Equivalência"
          value={filterToTriState(filters.hasEquivalence)}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              hasEquivalence: triStateToFilter(event.target.value),
              page: 1,
            })
          }
        >
          {TRI_STATE_OPTIONS.map((option) => (
            <MenuItem key={`eq-${option.value || 'all'}`} value={option.value}>
              {option.label === 'Todos'
                ? 'Com/sem equivalência'
                : `${option.label} equivalência`}
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
