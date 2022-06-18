/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';

import SFlex from 'components/atoms/SFlex';
import { selectGhoSearch } from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { SideRowGho } from '../SideRowGho';
import { SideRowTable } from '../SideRowTable/SingleGho';
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
    const searchSelected = useAppSelector(selectGhoSearch);

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
      !stringNormalize(gho.name).includes(stringNormalize(searchSelected));

    return (
      <SFlex
        key={gho.id}
        ref={ref}
        sx={{
          gridTemplateColumns: '285px 1fr',
          display: isToFilter ? 'none' : 'grid',
        }}
        gap={5}
      >
        <SideRowGho
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
