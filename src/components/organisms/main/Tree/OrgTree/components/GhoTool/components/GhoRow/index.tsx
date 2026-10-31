import { useGseVisualAssistance } from '../../../GseVisualAssistance/GseVisualAssistance.context';
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';

import SFlex from 'components/atoms/SFlex';
import { SPopperHelper } from 'components/molecules/SPopperArrow/SPopperHelper';
import { selectGhoSearch } from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useDisclosure } from 'core/hooks/useDisclosure';
import { useObserverHide } from 'core/hooks/useObserverHide';
import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';
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
    const assisted = !!useGseVisualAssistance()?.active;
    const isSelected = selectedGhoId === gho.id;
    const { hide, ref } = useObserverHide();
    const searchSelected = useAppSelector(selectGhoSearch);
    const isOrgMultiWorkspace = useOrgMultiWorkspaceMode();

    const { isOpen, close } = useDisclosure(true);
    const anchorEl = useRef<HTMLDivElement>(null);

    const isToFilter =
      searchSelected &&
      !stringNormalize(gho.name).includes(stringNormalize(searchSelected));

    const displayNone =
      isToFilter || (!assisted && selectedGhoId && !isSelected);

    return (
      <>
        <SFlex
          key={gho.id}
          ref={ref}
          sx={{
            gridTemplateColumns: assisted ? 'minmax(0, 1fr)' : '285px 1fr',
            width: assisted ? '100%' : undefined,
            minWidth: assisted ? 0 : undefined,
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
          show={!assisted && isFirst && !isOrgMultiWorkspace}
          content="Click aqui para adicionar setores e cargos ao GSE"
          isOpen={!assisted && isOpen && !isOrgMultiWorkspace}
          close={close}
          anchorEl={anchorEl}
          minWidth={'400px'}
        />
      </>
    );
  },
);
