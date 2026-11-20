import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import SText from 'components/atoms/SText';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { hierarchyList } from 'core/constants/maps/hierarchy.constant';
import { useHierarchyTypeLabels } from 'core/hooks/useHierarchyTypeLabels';
import {
  riskEditorActionSx,
  riskEditorPrimaryActionSx,
} from 'configs/theme/risk-editor-action';
const HierarchyRiskLevelContext = createContext({
  hierarchyLevel: HierarchyEnum.SECTOR,
  setHierarchyLevel: (_level: HierarchyEnum) => {},
});
export function HierarchyRiskLevelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [hierarchyLevel, setHierarchyLevel] = useState(HierarchyEnum.SECTOR);
  return (
    <HierarchyRiskLevelContext.Provider
      value={{ hierarchyLevel, setHierarchyLevel }}
    >
      {children}
    </HierarchyRiskLevelContext.Provider>
  );
}
export const useHierarchyRiskLevel = () =>
  useContext(HierarchyRiskLevelContext);
export function HierarchyRiskLevelFilter() {
  const { hierarchyLevel, setHierarchyLevel } = useHierarchyRiskLevel();
  const typeLabels = useHierarchyTypeLabels();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
        py: 3,
      }}
    >
      <SText color="text.secondary">Nível hierárquico:</SText>
      <ToggleButtonGroup
        exclusive
        value={hierarchyLevel}
        aria-label="Nível hierárquico por risco"
        onChange={(_, value: HierarchyEnum | null) => {
          if (value) setHierarchyLevel(value);
        }}
        sx={{
          flexWrap: 'wrap',
          gap: 3,
          '& .MuiToggleButtonGroup-grouped': {
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '999px !important',
            m: 0,
          },
        }}
      >
        {hierarchyList.map((level) => (
          <ToggleButton
            key={level.value}
            value={level.value}
            sx={
              hierarchyLevel === level.value
                ? riskEditorPrimaryActionSx
                : riskEditorActionSx
            }
          >
            {typeLabels[level.value]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
