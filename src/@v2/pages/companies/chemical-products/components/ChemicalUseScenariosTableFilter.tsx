import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';

import {
  EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS,
  USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS,
  type UseScenarioBoardFilterOptions,
  type UseScenarioBoardRiskFactorFilterOption,
  type UseScenarioBoardViewFilters,
} from './chemical-use-scenario-board-view.util';

type TextOption = { value: string; label: string };

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  ...USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

function toTextOptions(values: string[]): TextOption[] {
  return values.map((value) => ({ value, label: value }));
}

export function ChemicalUseScenariosTableFilter({
  filters,
  options,
  onFilterChange,
}: {
  filters: UseScenarioBoardViewFilters;
  options: UseScenarioBoardFilterOptions;
  onFilterChange: (patch: Partial<UseScenarioBoardViewFilters>) => void;
}) {
  const productOptions = toTextOptions(options.products);
  const activityOptions = toTextOptions(options.activities);
  const sectorOptions = toTextOptions(options.sectors);
  const exposureGroupOptions = toTextOptions(options.exposureGroups);

  const selectedProduct =
    productOptions.find((option) => option.value === filters.product) || null;
  const selectedRiskFactor =
    options.riskFactors.find((option) => option.id === filters.riskFactor) ||
    null;
  const selectedActivity =
    activityOptions.find((option) => option.value === filters.activity) || null;
  const selectedSector =
    sectorOptions.find((option) => option.value === filters.sector) || null;
  const selectedExposureGroup =
    exposureGroupOptions.find(
      (option) => option.value === filters.exposureGroup,
    ) || null;

  return (
    <SFlex direction="column" gap={4} width={360} pb={10}>
      <SSearchSelect
        label="Produto"
        placeholder="selecione"
        value={selectedProduct}
        options={productOptions}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) => onFilterChange({ product: option?.value || '' })}
      />
      <SSearchSelect
        label="Fator de risco"
        placeholder="selecione"
        value={selectedRiskFactor}
        options={options.riskFactors}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.id}
        onChange={(option: UseScenarioBoardRiskFactorFilterOption | null) =>
          onFilterChange({ riskFactor: option?.id || '' })
        }
      />
      <SSearchSelect
        label="Tarefa"
        placeholder="selecione"
        value={selectedActivity}
        options={activityOptions}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) => onFilterChange({ activity: option?.value || '' })}
      />
      <SSearchSelect
        label="Setor"
        placeholder="selecione"
        value={selectedSector}
        options={sectorOptions}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) => onFilterChange({ sector: option?.value || '' })}
      />
      <SSearchSelect
        label="GSE"
        placeholder="selecione"
        value={selectedExposureGroup}
        options={exposureGroupOptions}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) =>
          onFilterChange({ exposureGroup: option?.value || '' })
        }
      />
      <SSearchSelect
        label="Status"
        placeholder="selecione"
        hideSearchInput
        value={
          STATUS_OPTIONS.find((option) => option.value === filters.status) ||
          STATUS_OPTIONS[0]
        }
        options={STATUS_OPTIONS}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) =>
          onFilterChange({
            status: option?.value || EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS.status,
          })
        }
      />
    </SFlex>
  );
}
