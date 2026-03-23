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
  inputRef,
  viewType,
  ghoQuery,
  viewDataType,
  loadingCopy,
  companyId,
}) => {
  return (
    <SFlex align="center" gap={4} mb={5}>
      <Box width="100%">
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
            companyId={companyId}
          />
        )}
      </Box>
    </SFlex>
  );
};
