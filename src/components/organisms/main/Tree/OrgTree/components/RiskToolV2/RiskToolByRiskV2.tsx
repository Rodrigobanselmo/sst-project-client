import React, { ReactNode } from 'react';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { RiskToolByRiskView } from './components/RiskToolViews/RiskToolByRiskView';
import { RiskRowsExpandProvider } from './components/RiskToolViews/RiskToolGSEView/RiskRowsExpandContext';
import { RiskToolWideFrame } from './components/RiskToolWideFrame';
import {
  RiskToolWideViewProvider,
  useRiskToolWideViewOptional,
} from './components/RiskToolWideViewContext';
import { RiskCatalogDndProvider } from './risk-catalog-dnd/RiskCatalogDndProvider';
import { STBoxStack, STTableContainer } from './RiskTool.styles';
import { ViewTypeEnum } from './utils/view-risk-type.constant';

type RiskToolByRiskV2Props = {
  risk: IRiskFactors;
  riskGroupId: string;
  /** Valor da V1 (`state.riskAdd.viewData`). */
  viewData: string;
  /** Seletor de modo da ferramenta que abriu a visualização (V1). */
  topButtons: ReactNode;
  extraActions?: ReactNode;
  selectExpanded?: boolean;
};

/** Visualização "Por risco" com componentes V2: um bloco recolhível por GSE. */
export const RiskToolByRiskV2 = ({
  risk,
  riskGroupId,
  viewData,
  topButtons,
  extraActions,
  selectExpanded,
}: RiskToolByRiskV2Props) => (
  <RiskCatalogDndProvider>
    <RiskToolWideViewProvider>
      <RiskToolWideFrame selectExpanded={!!selectExpanded}>
        {topButtons}
        <STTableContainer
          sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <RiskRowsExpandProvider>
            <RiskToolByRiskStack selectExpanded={!!selectExpanded}>
              <RiskToolByRiskView
                risk={risk}
                riskGroupId={riskGroupId}
                viewData={viewData}
                extraActions={extraActions}
              />
            </RiskToolByRiskStack>
          </RiskRowsExpandProvider>
        </STTableContainer>
      </RiskToolWideFrame>
    </RiskToolWideViewProvider>
  </RiskCatalogDndProvider>
);

function RiskToolByRiskStack({
  selectExpanded,
  children,
}: {
  selectExpanded: boolean;
  children: ReactNode;
}) {
  const wideView = !!useRiskToolWideViewOptional()?.wideView;

  return (
    <STBoxStack
      expanded={selectExpanded ? 1 : 0}
      risk_init={1}
      viewType={ViewTypeEnum.SIMPLE_BY_RISK}
      wide={wideView ? 1 : 0}
    >
      {children}
    </STBoxStack>
  );
}
