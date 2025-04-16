import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IDocumentControlFilterProps } from '@v2/components/organisms/STable/implementation/SDocumentControlTable/SDocumentControlTable.types';
import { useState } from 'react';

interface DocumentControlTableFilterTypeProps {
  onFilterData: (props: IDocumentControlFilterProps) => void;
  filters: IDocumentControlFilterProps;
  types: string[];
}

export const DocumentControlTableFilterType = ({
  onFilterData,
  filters,
  types,
}: DocumentControlTableFilterTypeProps) => {
  const isLoading = false;

  return (
    <SSearchSelectMultiple
      value={filters.types || []}
      boxProps={{ flex: 1 }}
      options={types}
      loading={isLoading}
      label="Tipos"
      getOptionLabel={(option) => option}
      getOptionValue={(option) => option}
      onChange={(option) =>
        onFilterData({
          types: option,
        })
      }
    />
  );
};
