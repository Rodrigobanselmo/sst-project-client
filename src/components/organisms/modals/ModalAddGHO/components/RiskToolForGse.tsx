import { useEffect, useRef } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { RiskToolV2 } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/RiskTool';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/utils/view-data-type.constant';
import SText from 'components/atoms/SText';
import { useRouter } from 'next/router';
import {
  setGhoSelectedId,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import { setRiskAddState } from 'store/reducers/hierarchy/riskAddSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { IGho } from 'core/interfaces/api/IGho';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import {
  CHARACTERIZATION_INLINE_RISK_TOOL_HEIGHT,
} from 'pages/dashboard/empresas/[companyId]/novo/[stage]/constants/characterization-inline-layout.constants';

type RiskToolForGseProps = {
  companyId: string;
  ghoId: string;
  ghoName?: string;
  gho?: IGho | null;
};

export const RiskToolForGse = ({
  companyId,
  ghoId,
  ghoName,
  gho,
}: RiskToolForGseProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const didSyncUrlRef = useRef(false);

  const { data: riskGroupData, isLoading: isLoadingRiskGroup } =
    useQueryRiskGroupData(companyId);

  const riskGroupId =
    riskGroupData && riskGroupData.length > 0
      ? riskGroupData[riskGroupData.length - 1]?.id
      : undefined;

  useEffect(() => {
    if (!ghoId) return;

    dispatch(
      setRiskAddState({
        viewData: ViewsDataEnum.GSE as any,
        isEdited: false,
      }),
    );

    const ghoRecord =
      gho ||
      ({
        id: ghoId,
        name: ghoName || '',
        description: '',
      } as IGho);

    const hierarchies =
      ghoRecord.hierarchyOnHomogeneous?.map((h) => h.hierarchyId) || [];

    dispatch(
      setGhoState({
        data: ghoRecord,
        hierarchies,
      }),
    );
    dispatch(
      setGhoSelectedId({
        childrenIds: (ghoRecord as any)?.children?.map((i: any) => i?.id),
        ...ghoRecord,
      } as any),
    );

    const { query, pathname } = router;
    if (
      query.ghoId === ghoId &&
      query.viewData === ViewsDataEnum.GSE
    ) {
      didSyncUrlRef.current = true;
      return;
    }

    didSyncUrlRef.current = true;
    void router.replace(
      {
        pathname,
        query: {
          ...query,
          viewData: ViewsDataEnum.GSE,
          ghoId,
        },
      },
      undefined,
      { shallow: true },
    );

    return () => {
      if (!didSyncUrlRef.current) return;

      const { query: currentQuery, pathname: currentPathname } = router;
      const shouldClean =
        currentQuery.viewData === ViewsDataEnum.GSE &&
        currentQuery.ghoId === ghoId;

      if (!shouldClean) return;

      const nextQuery = { ...currentQuery };
      delete nextQuery.ghoId;
      delete nextQuery.viewData;

      void router.replace(
        { pathname: currentPathname, query: nextQuery },
        undefined,
        { shallow: true },
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghoId, ghoName, gho, dispatch]);

  if (isLoadingRiskGroup) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
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
          minHeight: 200,
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
        height: CHARACTERIZATION_INLINE_RISK_TOOL_HEIGHT,
        minHeight: 420,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <RiskToolV2
          riskGroupId={riskGroupId}
          riskContextCompanyId={companyId}
          embedded
          lockedViewData={ViewsDataEnum.GSE}
          lockedGhoId={ghoId}
          lockedGhoName={ghoName || gho?.name}
          hideViewSwitcher
          hideGhoPicker
          disableEditGho
        />
      </Box>
    </Box>
  );
};
