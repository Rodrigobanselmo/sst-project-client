/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from 'react';

import { Box, CircularProgress } from '@mui/material';
import SText from 'components/atoms/SText';
import { RiskToolV2 } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/RiskTool';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/view-data-type.constant';
import { getCurrentRiskGroupId } from 'components/organisms/modals/ModalAddCharacterization/utils/get-current-risk-group-id.util';
import { useRouter } from 'next/router';
import {
  setGhoSelectedId,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import { setRiskAddState } from 'store/reducers/hierarchy/riskAddSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

const VIEWS_DATA_VALUES = new Set<string>(Object.values(ViewsDataEnum));

/**
 * Characterization sub-tab: transversal RiskTool for linking risks by entity
 * (GSE / Environments / Hierarchy) without opening an Ambiente or GSE editor.
 */
export const RiskToolByEntityTabContent = () => {
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const { companyId } = useGetCompanyId();
  const { data: riskGroupData, isLoading: isLoadingRiskGroup } =
    useQueryRiskGroupData(companyId || undefined);

  const riskGroupId = useMemo(
    () => getCurrentRiskGroupId(riskGroupData),
    [riskGroupData],
  );

  useEffect(() => {
    // Default de entrada: GSE (conceito clássico de vínculo por exposição).
    // Se a URL já trouxer viewData explícito e válido, preservar.
    const viewDataParam = query.viewData;
    const fromUrl =
      typeof viewDataParam === 'string' && VIEWS_DATA_VALUES.has(viewDataParam)
        ? (viewDataParam as ViewsDataEnum)
        : null;

    dispatch(
      setRiskAddState({
        viewData: (fromUrl ?? ViewsDataEnum.GSE) as any,
        isEdited: false,
      }),
    );

    return () => {
      // Isolate Redux selection so contextual Ambientes/GSE embeds start clean.
      dispatch(setGhoSelectedId(null));
      dispatch(
        setGhoState({
          data: null,
          hierarchies: [],
          search: '',
          searchSelect: '',
          searchRisk: '',
        }),
      );
    };
  }, [dispatch, query.viewData]);

  if (isLoadingRiskGroup) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 280,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!riskGroupId) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 280,
          px: 2,
        }}
      >
        <SText variant="body1" textAlign="center">
          Nenhum grupo de risco encontrado.
        </SText>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 12rem)',
        minHeight: 420,
        overflow: 'hidden',
        '@supports (height: 100dvh)': {
          height: 'calc(100dvh - 12rem)',
        },
      }}
    >
      <Box sx={{ px: 1, pt: 1, pb: 1.5, flexShrink: 0 }}>
        <SText color="text.secondary" fontSize={13}>
          Fatores de riscos por entidade — GSE, Elementos Caracterizados e Hierarquia.
        </SText>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <RiskToolV2
          riskGroupId={riskGroupId}
          riskContextCompanyId={companyId || undefined}
          embedded
        />
      </Box>
    </Box>
  );
};
