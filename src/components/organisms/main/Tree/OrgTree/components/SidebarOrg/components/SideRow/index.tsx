/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';

import SFlex from 'components/atoms/SFlex';

import { SideGhoItem } from '../SideRowGho';
import { SideRowTable } from '../SideRowTable/Single';
import { SideRowProps } from './types';

function onVisible(callback: any) {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        callback(false);
      } else {
        callback(true);
      }
    });
  });
}

export const SideRow = React.memo<SideRowProps>(
  ({
    handleDeleteGHO,
    handleSelectGHO,
    handleEditGHO,
    selectedGhoId,
    gho,
    isRiskOpen,
    isDeleteLoading,
    riskData,
  }) => {
    const isSelected = selectedGhoId === gho.id;
    const ref = useRef<HTMLDivElement>(null);
    const [hide, setHide] = useState(true);

    useEffect(() => {
      if (ref.current) {
        const x = onVisible((e: boolean) => setHide(e));
        x.observe(ref.current);

        return () => {
          x.disconnect();
        };
      }
    }, []);

    return (
      <SFlex
        key={gho.id}
        ref={ref}
        sx={{
          gridTemplateColumns: '285px 1fr',
          display: 'grid',
        }}
        gap={5}
      >
        <SideGhoItem
          data={gho}
          isSelected={isSelected}
          handleEditGHO={handleEditGHO}
          handleSelectGHO={handleSelectGHO}
          handleDeleteGHO={handleDeleteGHO}
          isDeleteLoading={isDeleteLoading}
          hide={hide}
        />
        {isRiskOpen && (
          <SideRowTable
            isSelected={isSelected}
            hide={hide}
            gho={gho}
            riskData={riskData}
          />
        )}
      </SFlex>
    );
  },
);
