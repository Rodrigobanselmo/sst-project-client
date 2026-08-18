import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';

import {
  EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS,
  UNLINKED_RISK_FACTOR_CHIP_LABEL,
  type ChemicalProductTableCompositionFilter,
  type ChemicalProductTableConfidentialFilter,
  type ChemicalProductTableEmployeesFispqFilter,
  type ChemicalProductTableProductTypeFilter,
  type ChemicalProductTableRiskLinkFilter,
  type ChemicalProductTableViewFilters,
} from './chemical-product-table-view.util';

type Option<T extends string> = { value: T; label: string };

const PRODUCT_TYPE_OPTIONS: Option<ChemicalProductTableProductTypeFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pure', label: 'Produto puro' },
  { value: 'mixture', label: 'Mistura' },
];

const RISK_LINK_OPTIONS: Option<ChemicalProductTableRiskLinkFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'linked', label: 'Com fatores correlacionados' },
  { value: 'unlinked', label: UNLINKED_RISK_FACTOR_CHIP_LABEL },
];

const COMPOSITION_OPTIONS: Option<ChemicalProductTableCompositionFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'incomplete', label: 'Somente composição <100%' },
];

const CONFIDENTIAL_OPTIONS: Option<ChemicalProductTableConfidentialFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'confidential', label: 'Com ingrediente confidencial' },
];

const EMPLOYEES_FISPQ_OPTIONS: Option<ChemicalProductTableEmployeesFispqFilter>[] =
  [
    { value: 'all', label: 'Todos' },
    { value: 'published', label: 'Publicada para empregados' },
    { value: 'unpublished', label: 'Não publicada' },
  ];

export function ChemicalProductsTableFilter({
  filters,
  onFilterChange,
  includeArchived,
  onIncludeArchivedChange,
  manufacturers,
}: {
  filters: ChemicalProductTableViewFilters;
  onFilterChange: (patch: Partial<ChemicalProductTableViewFilters>) => void;
  includeArchived: boolean;
  onIncludeArchivedChange: (checked: boolean) => void;
  manufacturers: string[];
}) {
  const manufacturerOptions = manufacturers.map((name) => ({
    value: name,
    label: name,
  }));
  const selectedManufacturer =
    manufacturerOptions.find((option) => option.value === filters.manufacturer) ||
    null;

  return (
    <SFlex direction="column" gap={4} width={360} pb={10}>
      <SSwitch
        label="Incluir arquivados"
        value={includeArchived}
        formControlProps={{ sx: { mx: 1 } }}
        onChange={(_, checked) => onIncludeArchivedChange(checked)}
      />
      <SSearchSelect
        label="Fabricante"
        placeholder="selecione"
        value={selectedManufacturer}
        options={manufacturerOptions}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) =>
          onFilterChange({ manufacturer: option?.value || '' })
        }
      />
      <SSearchSelect
        label="Tipo"
        placeholder="selecione"
        hideSearchInput
        value={
          PRODUCT_TYPE_OPTIONS.find((option) => option.value === filters.productType) ||
          PRODUCT_TYPE_OPTIONS[0]
        }
        options={PRODUCT_TYPE_OPTIONS}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) =>
          onFilterChange({
            productType:
              option?.value || EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS.productType,
          })
        }
      />
      <SSearchSelect
        label="Correlação de fator"
        placeholder="selecione"
        hideSearchInput
        value={
          RISK_LINK_OPTIONS.find((option) => option.value === filters.riskLink) ||
          RISK_LINK_OPTIONS[0]
        }
        options={RISK_LINK_OPTIONS}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) =>
          onFilterChange({
            riskLink:
              option?.value || EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS.riskLink,
          })
        }
      />
      <SSearchSelect
        label="Composição incompleta"
        placeholder="selecione"
        hideSearchInput
        value={
          COMPOSITION_OPTIONS.find((option) => option.value === filters.composition) ||
          COMPOSITION_OPTIONS[0]
        }
        options={COMPOSITION_OPTIONS}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) =>
          onFilterChange({
            composition:
              option?.value || EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS.composition,
          })
        }
      />
      <SSearchSelect
        label="Ingrediente confidencial"
        placeholder="selecione"
        hideSearchInput
        value={
          CONFIDENTIAL_OPTIONS.find(
            (option) => option.value === filters.confidential,
          ) || CONFIDENTIAL_OPTIONS[0]
        }
        options={CONFIDENTIAL_OPTIONS}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) =>
          onFilterChange({
            confidential:
              option?.value || EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS.confidential,
          })
        }
      />
      <SSearchSelect
        label="FISPQ para empregados"
        placeholder="selecione"
        hideSearchInput
        value={
          EMPLOYEES_FISPQ_OPTIONS.find(
            (option) => option.value === filters.employeesFispq,
          ) || EMPLOYEES_FISPQ_OPTIONS[0]
        }
        options={EMPLOYEES_FISPQ_OPTIONS}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) =>
          onFilterChange({
            employeesFispq:
              option?.value ||
              EMPTY_CHEMICAL_PRODUCT_TABLE_VIEW_FILTERS.employeesFispq,
          })
        }
      />
    </SFlex>
  );
}
