/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useSstAccess } from '@v2/features/sst-operational/access';
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
  riskGroupId,
  hideGhoPicker = false,
  lockedGhoName,
  disableEditGho = false,
}) => {
  const router = useRouter();
  const { canRead } = useSstAccess();
  return (
    <SFlex direction="column" align="stretch" gap={4} mb={8}>
      {canRead && (
        <Button
          size="small"
          sx={{ alignSelf: 'flex-end', flexShrink: 0, whiteSpace: 'nowrap' }}
          onClick={() =>
            router.push(`/dashboard/empresas/${companyId}/esocial`)
          }
        >
          Acompanhamento eSocial
        </Button>
      )}
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
            riskGroupId={riskGroupId}
            hideGhoPicker={hideGhoPicker}
            lockedGhoName={lockedGhoName}
            disableEditGho={disableEditGho}
          />
        )}
      </Box>
    </SFlex>
  );
};
