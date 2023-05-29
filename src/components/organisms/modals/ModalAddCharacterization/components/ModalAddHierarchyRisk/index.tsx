/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { IUseEditCharacterization } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
import { HierarchyHomoTable } from 'components/organisms/tables/HierarchyHomoTable/HierarchyHomoTable';

export const ModalAddHierarchyRisk = ({
  onAddHierarchy,
  onAddRisk,
  hierarchies,
  dataLoading: characterizationLoading,
  mt = 10,
  isEdit,
}: IUseEditCharacterization & { mt?: number | string }) => {
  return (
    <Box mt={mt}>
      <Wizard
        header={
          <WizardTabs
            onChangeTab={(v, cb) => (v != 1 ? cb(v) : onAddRisk?.())}
            options={[{ label: 'Cargos' }, { label: 'Fatores de Riscos' }]}
          />
        }
      >
        <Box sx={{ px: 5, pb: 10 }}>
          <HierarchyHomoTable
            onAdd={onAddHierarchy}
            loading={characterizationLoading}
            hierarchies={hierarchies as any}
            isCreate={!isEdit}
          />
        </Box>
        <Box sx={{ px: 5, pb: 10 }}>{/* <ExamsRiskTable /> */}</Box>
      </Wizard>
    </Box>
  );
};
