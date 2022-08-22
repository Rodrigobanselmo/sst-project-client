/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { RiskEnum } from 'project/enum/risk.enums';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useObserverHide } from 'core/hooks/useObserverHide';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { RiskToolSingleRiskRow } from '../../../SideRowTable/SingleRisk';
import { RiskToolGSEViewRowRiskBox } from './RiskBox';
import { SideRowProps } from './types';

export const RiskToolGSEViewRow = React.memo<SideRowProps>(
  ({ risk, riskData, riskGroupId }) => {
    const searchSelected = useAppSelector((state) => state?.gho.searchRisk);
    const { hide, ref } = useObserverHide();
    const isRepresentAll = risk.type === RiskEnum.OUTROS && risk.representAll;

    const isToFilter =
      searchSelected &&
      !stringNormalize(risk.name).includes(stringNormalize(searchSelected));

    return (
      <SFlex
        key={risk.id}
        ref={ref}
        sx={{
          gridTemplateColumns: '285px 1fr',
          display: isToFilter ? 'none' : 'grid',
        }}
        gap={5}
      >
        <RiskToolGSEViewRowRiskBox
          riskData={riskData}
          data={risk}
          hide={hide}
          riskGroupId={riskGroupId}
          isRepresentAll={isRepresentAll}
        />
        <RiskToolSingleRiskRow
          hide={hide}
          riskGroupId={riskGroupId}
          risk={risk}
          riskData={riskData}
          isRepresentAll={isRepresentAll}
        />
      </SFlex>
    );
  },
);
