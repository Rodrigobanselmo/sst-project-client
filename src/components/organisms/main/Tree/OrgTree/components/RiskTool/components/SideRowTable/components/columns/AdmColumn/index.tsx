import React, { FC } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
import { ControlCorrespondenceRowAction } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/ExistingControlCorrespondenceAction';
import { filterImplementedControls } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/derived-control-scope.util';
import { openFactorLinkedControlIds } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/existing-control-correspondence.util';
import { MedTypeEnum } from 'project/enum/medType.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { SelectedTableItem } from '../../SelectedTableItem';
import { AdmColumnProps } from './types';

export const AdmColumn: FC<{ children?: any } & AdmColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
  planWorkspaceId,
}) => {
  const { companyId } = useGetCompanyId();
  return (
    <Box>
      <MedSelect
        disabled={!risk?.id}
        onlyFromActualRisks
        text={'adicionar'}
        tooltipTitle=""
        multiple={false}
        lockSelected
        selectedMed={(data?.adms ?? [])
          .map((adm) => adm?.id)
          .filter((id): id is string => typeof id === 'string' && !!id)}
        existingControlLinkedIds={openFactorLinkedControlIds(data?.recs)}
        factorRecs={data?.recs}
        factorDataRecs={data?.dataRecs}
        factorDerivedMeasures={data?.riskFactorDataRecDerivedMeasures}
        planWorkspaceId={planWorkspaceId}
        riskIds={[risk?.id || '']}
        risk={risk ? risk : undefined}
        type={MedTypeEnum.ADM}
        onlyInput="adm"
        onCreate={(adm) => {
          if (adm && adm.id && adm.medType === MedTypeEnum.ADM)
            handleSelect(
              {
                adms: [adm.id],
              },
              adm,
            );

          document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
        }}
        handleSelect={(options) => {
          const op = options as IRecMed;
          if (op.id)
            handleSelect(
              {
                adms: [op.id],
              },
              op,
            );
        }}
      />
      {data &&
        filterImplementedControls({
          controls: data.adms ?? [],
          getId: (adm) => adm?.id,
          derivedLinks: data.riskFactorDataRecDerivedMeasures,
          workspaceId: planWorkspaceId,
        }).map((adm) => (
          <React.Fragment key={adm.id}>
            <SelectedTableItem
              name={adm.medName}
              recType={
                adm.medType === MedTypeEnum.ADM ||
                adm.medType === MedTypeEnum.ENG
                  ? adm.medType
                  : undefined
              }
              handleRemove={() =>
                handleRemove({
                  adms: [adm.id],
                })
              }
              trailingAction={
                <ControlCorrespondenceRowAction
                  kind="adm"
                  control={adm}
                  recs={data.recs}
                  dataRecs={data.dataRecs}
                  derivedMeasures={data.riskFactorDataRecDerivedMeasures}
                  workspaceId={planWorkspaceId}
                  companyId={companyId}
                  onLink={(payload) => handleSelect(payload, adm)}
                  onUndo={handleRemove}
                />
              }
            />
          </React.Fragment>
        ))}
    </Box>
  );
};
