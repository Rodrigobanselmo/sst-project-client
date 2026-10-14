import { useMemo, useState } from 'react';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Button, IconButton } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useRouter } from 'next/router';
import { RoleEnum } from 'project/enum/roles.enums';
import { selectUserRoles } from 'store/reducers/user/userSlice';

import { SuggestCatalogRisksMasterConfigDialog } from '../../suggest-catalog-risks-ai/SuggestCatalogRisksMasterConfigDialog';
import { SuggestCatalogRisksWithAiDialog } from '../../suggest-catalog-risks-ai/SuggestCatalogRisksWithAiDialog';
import { resolveSuggestCatalogRisksContext } from '../../suggest-catalog-risks-ai/resolve-suggest-catalog-risks-context.util';
import { ViewsDataEnum } from '../../utils/view-data-type.constant';
import { ViewTypeEnum } from '../../utils/view-risk-type.constant';
import { SideTopProps } from './types';

type Props = Partial<SideTopProps> & {
  viewDataType: ViewsDataEnum;
  viewType: ViewTypeEnum;
  riskGroupId: string;
  /** Preferencial: empresa do RiskTool (route / riskContextCompanyId). */
  companyId?: string;
};

/**
 * Mesmo critério do CRUD SystemAiPrompt (API user.isAdmin):
 * roles.includes(RoleEnum.MASTER). Evita o prefix-match de isMaster
 * (split('-')[0]), para não divergir do requireSystemMaster.
 */
function useIsSystemMaster(): boolean {
  const roles = useAppSelector(selectUserRoles);
  return useMemo(
    () => (roles ?? []).includes(RoleEnum.MASTER),
    [roles],
  );
}

export function SuggestCatalogRisksWithAiButton({
  viewDataType,
  viewType,
  riskGroupId,
  companyId: companyIdProp,
}: Props) {
  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const isSystemMaster = useIsSystemMaster();
  const { companyId: routeCompanyId, workspaceId: routeWorkspaceId } =
    useGetCompanyId();
  const companyId = companyIdProp || routeCompanyId;
  const router = useRouter();
  const selectedGho = useAppSelector((state) => state.gho.selected);

  const isViewTypeGroup = viewType === ViewTypeEnum.SIMPLE_BY_GROUP;
  const context = useMemo(
    () =>
      resolveSuggestCatalogRisksContext({
        viewDataType,
        companyId: companyId || undefined,
        riskGroupId,
        selectedEntityId: selectedGho?.id,
        routeWorkspaceId:
          routeWorkspaceId ||
          (router.query.workspaceId as string | undefined),
        tabWorkspaceId: router.query.tabWorkspaceId as string | undefined,
        entityWorkspaceIds: (selectedGho as { workspaceIds?: string[] } | null)
          ?.workspaceIds,
      }),
    [
      viewDataType,
      companyId,
      riskGroupId,
      selectedGho,
      routeWorkspaceId,
      router.query.workspaceId,
      router.query.tabWorkspaceId,
    ],
  );

  const configKind =
    viewDataType === ViewsDataEnum.GSE
      ? 'gse'
      : viewDataType === ViewsDataEnum.CHARACTERIZATION
        ? 'characterization'
        : null;

  if (!isViewTypeGroup) return null;
  if (
    viewDataType !== ViewsDataEnum.GSE &&
    viewDataType !== ViewsDataEnum.CHARACTERIZATION
  ) {
    return null;
  }

  const masterConfigControl =
    isSystemMaster && configKind ? (
      <>
        <STooltip withWrapper title="Configurar orientação funcional (master)">
          <IconButton
            size="small"
            aria-label="Configurar orientação funcional (master)"
            onClick={() => setConfigOpen(true)}
            sx={{ ml: -1.5, mr: 1 }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </STooltip>
        <SuggestCatalogRisksMasterConfigDialog
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          kind={configKind}
        />
      </>
    ) : null;

  if (!selectedGho?.id) {
    return (
      <SFlex align="center" gap={0.75} sx={{ mr: 2 }}>
        <STooltip
          withWrapper
          title="Selecione uma entidade para sugerir riscos com IA."
        >
          <SFlex align="center" gap={0.75} sx={{ cursor: 'default' }}>
            <InfoOutlined
              sx={{ fontSize: 18, color: 'text.secondary' }}
              aria-hidden
            />
            <SText fontSize={13} color="text.secondary" lineNumber={1}>
              Sugerir riscos com IA
            </SText>
          </SFlex>
        </STooltip>
        {masterConfigControl}
      </SFlex>
    );
  }

  if (!context) {
    return (
      <SFlex align="center" gap={0.75} sx={{ mr: 2 }}>
        <STooltip
          withWrapper
          title="Vincule ao menos um estabelecimento para sugerir riscos com IA."
        >
          <SFlex align="center" gap={0.75} sx={{ cursor: 'default' }}>
            <InfoOutlined
              sx={{ fontSize: 18, color: 'text.secondary' }}
              aria-hidden
            />
            <SText fontSize={13} color="text.secondary" lineNumber={1}>
              Sugerir riscos com IA
            </SText>
          </SFlex>
        </STooltip>
        {masterConfigControl}
      </SFlex>
    );
  }

  return (
    <>
      <SFlex align="center" sx={{ mr: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AutoFixHighOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setOpen(true)}
          sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
        >
          ✨ Sugerir riscos com IA
        </Button>
        {masterConfigControl}
      </SFlex>
      <SuggestCatalogRisksWithAiDialog
        open={open}
        onClose={() => setOpen(false)}
        context={context}
      />
    </>
  );
}
