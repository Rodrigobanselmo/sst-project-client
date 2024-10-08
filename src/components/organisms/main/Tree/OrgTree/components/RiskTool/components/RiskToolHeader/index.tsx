/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { setGhoSearch } from 'store/reducers/hierarchy/ghoSlice';

import { IdsEnum } from 'core/enums/ids.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';

import { viewsDataOptionsConstant } from '../../utils/view-data-type.constant';
import { ViewTypeEnum } from '../../utils/view-risk-type.constant';
import { SideInput } from '../SIdeInput';
import { SideRowTableMulti } from '../SideRowTable/Multiple';
import { RiskToolColumns } from './RiskToolColumns';
import { RiskToolGhoHorizontal } from './RiskToolGhoHorizontal';
import { SideHeaderProps as RiskToolProps } from './types';

export const RiskToolHeader: FC<{ children?: any } & RiskToolProps> = ({
  handleSelectGHO,
  handleEditGHO,
  handleAddGHO,
  handleCopyGHO,
  isAddLoading,
  inputRef,
  riskInit,
  viewType,
  ghoQuery,
  viewDataType,
  loadingCopy,
  riskGroupId,
}) => {
  const dispatch = useAppDispatch();

  const showColumnsHeader =
    riskInit &&
    [ViewTypeEnum.MULTIPLE, ViewTypeEnum.SIMPLE_BY_RISK].includes(viewType);

  return (
    <SFlex align="center" gap={4} mb={5}>
      {viewType === ViewTypeEnum.SIMPLE_BY_RISK && (
        <SideInput
          id={IdsEnum.RISK_TOOL_GHO_INPUT_SEARCH}
          ref={inputRef}
          handleSelectGHO={handleSelectGHO}
          onSearch={(value) => dispatch(setGhoSearch(value))}
          handleEditGHO={handleEditGHO}
          handleAddGHO={handleAddGHO}
          isAddLoading={isAddLoading}
          placeholder={viewsDataOptionsConstant[viewDataType].placeholder}
        />
      )}
      <Box width="100%">
        {showColumnsHeader && <RiskToolColumns viewType={viewType} />}
        {viewType === ViewTypeEnum.MULTIPLE && (
          <SideRowTableMulti
            riskGroupId={riskGroupId}
            viewDataType={viewDataType}
          />
        )}
        {viewType === ViewTypeEnum.SIMPLE_BY_GROUP && (
          <RiskToolGhoHorizontal
            handleSelectGHO={handleSelectGHO}
            handleCopyGHO={handleCopyGHO}
            handleEditGHO={handleEditGHO}
            handleAddGHO={handleAddGHO}
            viewDataType={viewDataType}
            inputRef={inputRef}
            ghoQuery={ghoQuery}
            viewType={viewType}
            loadingCopy={!!loadingCopy}
          />
        )}
      </Box>
    </SFlex>
  );
};
