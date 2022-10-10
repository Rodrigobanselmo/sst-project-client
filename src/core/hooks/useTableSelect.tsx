import { useCallback, FC, useState } from 'react';

import { Box } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import STooltip from 'components/atoms/STooltip';

export const TableCheckSelectAll: FC<{
  onToggleAll: () => void;
  isSelected: boolean;
}> = ({ onToggleAll, isSelected }) => {
  return (
    <Box my={-5}>
      <STooltip title="Selecionar todos">
        <SCheckBox
          label=""
          onChange={() => {
            onToggleAll();
          }}
          checked={isSelected}
        />
      </STooltip>
    </Box>
  );
};

export const TableCheckSelect: FC<{
  onToggleSelected: () => void;
  isSelected: boolean;
}> = ({ onToggleSelected, isSelected }) => {
  return (
    <SCheckBox
      label=""
      onChange={(e) => {
        e.stopPropagation();
        onToggleSelected();
      }}
      checked={isSelected}
    />
  );
};

export const useTableSelect = () => {
  const [selectedData, setSelectedData] = useState<any[]>([]);

  const onToggleSelected = useCallback((id: any) => {
    setSelectedData((data) => {
      const found = data.find((select) => select == id);
      if (found) return data.filter((select) => !(select == id));

      return [...data, id];
    });
  }, []);

  const onToggleAll = useCallback((ids: any[]) => {
    setSelectedData((data) => {
      const found = data.find((select) => ids.includes(select));
      if (found) return data.filter((select) => !ids.includes(select));

      return [...data, ...ids];
    });
  }, []);

  const onIsSelected = useCallback(
    (rowId: any) => {
      if (!Array.isArray(rowId))
        return !!selectedData.find((id) => id === rowId);

      return rowId.every((rowId) => selectedData.find((id) => id === rowId));
    },
    [selectedData],
  );

  return {
    onToggleSelected,
    onIsSelected,
    onToggleAll,
    selectedData,
    setSelectedData,
  };
};

export type IUseTableSelect = ReturnType<typeof useTableSelect>;
