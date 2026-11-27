import { RiskEditorSection } from 'components/molecules/RiskEditorSection';
import { HierarchyRiskLevelFilter } from '../HierarchyRiskLevel';
import { ViewsDataEnum } from '../../utils/view-data-type.constant';
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
  actions,
  handleSelectGHO,
  handleEditGHO,
  handleAddGHO,
  handleCopyGHO,
  isAddLoading,
  riskInit,
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
  const dispatch = useAppDispatch();
  return (
    <SFlex direction="column" align="stretch" gap={4} mb={8}>
      {viewType === ViewTypeEnum.SIMPLE_BY_RISK && (
        <SFlex align="center" sx={{ flexWrap: 'wrap', gap: 5 }}>
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
          {viewDataType === ViewsDataEnum.HIERARCHY && (
            <HierarchyRiskLevelFilter />
          )}
        </SFlex>
      )}
      {viewType !== ViewTypeEnum.SIMPLE_BY_GROUP && (
        <RiskEditorSection title="Ferramentas dos fatores de risco" description="Inclusão de riscos e análise com IA">{actions}</RiskEditorSection>
      )}
      <Box width="100%">
        {riskInit && viewType !== ViewTypeEnum.SIMPLE_BY_GROUP && (
          <RiskToolColumns viewType={viewType} />
        )}
        {viewType === ViewTypeEnum.MULTIPLE && (
          <SideRowTableMulti
            riskGroupId={riskGroupId}
            viewDataType={viewDataType}
          />
        )}
        {viewType === ViewTypeEnum.SIMPLE_BY_GROUP && (
          <RiskToolGhoHorizontal
            actions={actions}
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
