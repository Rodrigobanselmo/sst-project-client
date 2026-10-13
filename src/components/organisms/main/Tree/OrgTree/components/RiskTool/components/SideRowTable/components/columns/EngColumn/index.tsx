import React, { FC } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
import { ControlCorrespondenceRowAction } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/ExistingControlCorrespondenceAction';
import { filterImplementedControls } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/derived-control-scope.util';
import { openFactorLinkedControlIds } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/existing-control-correspondence.util';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { isNaRecMed } from 'project/utils/isNa';

import { IdsEnum } from 'core/enums/ids.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import { SelectedTableItem } from '../../SelectedTableItem';
import { EngColumnProps } from './types';

export const EngColumn: FC<{ children?: any } & EngColumnProps> = ({
  handleSelect,
  handleRemove,
  handleEdit,
  data,
  risk,
  planWorkspaceId,
}) => {
  const { companyId } = useGetCompanyId();
  return (
    <Box>
      <MedSelect
        disabled={!risk?.id}
        text={'adicionar'}
        onlyInput="eng"
        onlyFromActualRisks
        tooltipTitle=""
        multiple={false}
        lockSelected
        selectedMed={(data?.engs ?? [])
          .map((eng) => eng?.id)
          .filter((id): id is string => typeof id === 'string' && !!id)}
        existingControlLinkedIds={openFactorLinkedControlIds(data?.recs)}
        factorRecs={data?.recs}
        factorDataRecs={data?.dataRecs}
        factorDerivedMeasures={data?.riskFactorDataRecDerivedMeasures}
        planWorkspaceId={planWorkspaceId}
        riskIds={[risk?.id || '']}
        risk={risk ? risk : undefined}
        type={MedTypeEnum.ENG}
        onCreate={(engs) => {
          if (engs && engs.id && engs.medType === MedTypeEnum.ENG)
            handleSelect(
              {
                engs: [{ ...engs?.engsRiskData, recMedId: engs.id }],
              },
              engs,
            );

          document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
        }}
        handleSelect={(options) => {
          if (Array.isArray(options) || !options.id) return;
          handleSelect(
            {
              engs: [{ ...options?.engsRiskData, recMedId: options.id }],
            },
            options,
          );
        }}
      />
      {data &&
        filterImplementedControls({
          controls: data.engs ?? [],
          getId: (eng) => eng?.id,
          derivedLinks: data.riskFactorDataRecDerivedMeasures,
          workspaceId: planWorkspaceId,
        }).map((eng) => (
          <React.Fragment key={eng.id}>
            <SelectedTableItem
              name={eng.medName}
              recType={
                eng.medType === MedTypeEnum.ADM ||
                eng.medType === MedTypeEnum.ENG
                  ? eng.medType
                  : undefined
              }
              handleEdit={() => !isNaRecMed(eng.medName) && handleEdit(eng)}
              handleRemove={() =>
                handleRemove({
                  engs: [eng.engsRiskData || eng],
                })
              }
              trailingAction={
                <ControlCorrespondenceRowAction
                  kind="eng"
                  control={eng}
                  recs={data.recs}
                  dataRecs={data.dataRecs}
                  derivedMeasures={data.riskFactorDataRecDerivedMeasures}
                  workspaceId={planWorkspaceId}
                  companyId={companyId}
                  onLink={(payload) => handleSelect(payload, eng)}
                  onUndo={handleRemove}
                />
              }
            />
          </React.Fragment>
        ))}
    </Box>
  );
};
