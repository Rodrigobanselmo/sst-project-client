import { useState } from 'react';
import { Wizard } from 'react-use-wizard';

import { Box, BoxProps } from '@mui/material';
import { SActionButton } from 'components/atoms/SActionButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { STabs } from 'components/molecules/STabs';
import { useHierarchyTreeLoad } from 'components/organisms/main/Tree/OrgTree/hooks/useHierarchyTreeLoad';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ExamsRiskTable } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { ExamsRiskTableList } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTableList';
import { ProtocolsRiskTable } from 'components/organisms/tables/ProtocolsRiskTable/ProtocolsRiskTable';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';

import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { CompanyActionEnum } from 'core/enums/company-action.enum';

export interface ICompanyStage extends Partial<BoxProps>, IUseCompanyStep {}

export const CharacterizationStage = ({
  characterizationStepMemo,
  characterizationActionsStepMemo,
  query,
  actionsMapStepMemo,
  ...props
}: ICompanyStage) => {
  useHierarchyTreeLoad();

  return (
    <Box {...props}>
      {/* <SText mt={0}>Caracterizar Riscos e Exames por:</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap" mb={20}>
        {characterizationStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex> */}

      <Wizard
        header={
          <WizardTabs
            shadow
            onUrl
            onChangeTab={(v, cb) => {
              if (v == 1) {
                actionsMapStepMemo[
                  CompanyActionEnum.CHARACTERIZATION
                ]?.onClick?.({} as any);
              } else if (v == 2) {
                actionsMapStepMemo[CompanyActionEnum.HOMO_GROUP]?.onClick?.(
                  {} as any,
                );
              } else if (v == 3) {
                actionsMapStepMemo[CompanyActionEnum.ACTION_PLAN]?.onClick?.(
                  {} as any,
                );
              } else {
                cb(v);
              }
            }}
            active={
              query.active
                ? query.active == '2' || query.active == '1'
                  ? 0
                  : Number(query.active)
                : 0
            }
            options={[
              {
                label: 'Riscos',
              },
              {
                label:
                  actionsMapStepMemo[CompanyActionEnum.CHARACTERIZATION].text,
              },
              {
                label: 'GSE',
              },
              {
                label: 'Plano de ação',
              },
              {
                label: 'Exames',
              },
              {
                label: 'Protocolos',
              },
            ]}
          />
        }
      >
        <>
          <RiskCompanyTable />
        </>
        <>
          <RiskCompanyTable />
        </>
        <>
          <RiskCompanyTable />
        </>
        <>
          <RiskCompanyTable />
        </>
        <>
          <ExamsRiskTable />
          <ExamsRiskTableList mt={20} />
        </>
        <>
          <ProtocolsRiskTable />
        </>
      </Wizard>
    </Box>
  );
};
