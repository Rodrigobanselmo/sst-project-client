/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';

import SFlex from 'components/atoms/SFlex';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { RiskToolSingleRiskRow } from '../../../SideRowTable/SingleRisk';
import { RiskToolGSEViewRowRiskBox } from './RiskBox';
import { SideRowProps } from './types';

function onVisible(callback: any) {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(false);
      } else {
        callback(true);
      }
    });
  });
}

export const RiskToolGSEViewRow = React.memo<SideRowProps>(
  ({ risk, riskData }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [hide, setHide] = useState(true);
    const searchSelected = useAppSelector((state) => state.gho.searchRisk);

    useEffect(() => {
      if (ref.current) {
        const x = onVisible((e: boolean) => setHide(e));
        x.observe(ref.current);

        return () => {
          x.disconnect();
        };
      }
    }, []);

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
        />
        <RiskToolSingleRiskRow hide={hide} risk={risk} riskData={riskData} />
      </SFlex>
    );
  },
);
