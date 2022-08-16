/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';

import SFlex from 'components/atoms/SFlex';
import { SPopperHelper } from 'components/molecules/SPopperArrow/SPopperHelper';
import { selectGhoSearch } from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useDisclosure } from 'core/hooks/useDisclosure';
import { useObserverHide } from 'core/hooks/useObserverHide';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { Row } from './Row';
import { GhoRowProps } from './types';

export const GhoRow = React.memo<GhoRowProps>(
  ({
    handleDeleteGHO,
    handleSelectGHO,
    handleEditGHO,
    selectedGhoId,
    gho,
    isDeleteLoading,
    isFirst,
  }) => {
    const isSelected = selectedGhoId === gho.id;
    const { hide, ref } = useObserverHide();
    const searchSelected = useAppSelector(selectGhoSearch);

    const { isOpen, close } = useDisclosure(true);
    const anchorEl = useRef<HTMLDivElement>(null);

    const isToFilter =
      searchSelected &&
      !stringNormalize(gho.name).includes(stringNormalize(searchSelected));

    const displayNone = isToFilter || (selectedGhoId && !isSelected);

    return (
      <>
        <SFlex
          key={gho.id}
          ref={ref}
          sx={{
            gridTemplateColumns: '285px 1fr',
            display: displayNone ? 'none' : 'grid',
          }}
          gap={5}
        >
          <Row
            data={gho}
            isSelected={isSelected}
            handleEditGHO={handleEditGHO}
            handleSelectGHO={handleSelectGHO}
            handleDeleteGHO={handleDeleteGHO}
            isDeleteLoading={isDeleteLoading}
            hide={hide}
            anchorEl={anchorEl}
          />
        </SFlex>
        <SPopperHelper
          show={isFirst}
          content="Click aqui para adicionar setores e cargos ao GSE"
          isOpen={isOpen}
          close={close}
          anchorEl={anchorEl}
          minWidth={'400px'}
        />
      </>
    );
  },
);
