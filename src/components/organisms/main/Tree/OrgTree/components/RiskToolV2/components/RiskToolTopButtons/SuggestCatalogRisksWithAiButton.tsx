import { useMemo, useState } from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, IconButton } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useRouter } from 'next/router';
import { RoleEnum } from 'project/enum/roles.enums';
import { selectUserRoles } from 'store/reducers/user/userSlice';

import {
  CATALOG_ONLY_AI_MODEL_SESSION_DEFAULTS,
  type CatalogOnlyAiModelSessionByKind,
} from '../../suggest-catalog-risks-ai/catalog-only-ai-model-options.constants';
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
  return useMemo(() => (roles ?? []).includes(RoleEnum.MASTER), [roles]);
}

export function SuggestCatalogRisksWithAiButton({
  viewDataType,
  viewType,
  riskGroupId,
  companyId: companyIdProp,
}: Props) {
  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [sessionModelByKind, setSessionModelByKind] =
    useState<CatalogOnlyAiModelSessionByKind>(
      CATALOG_ONLY_AI_MODEL_SESSION_DEFAULTS,
    );
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
          routeWorkspaceId || (router.query.workspaceId as string | undefined),
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
            sx={{ color: 'text.secondary', width: 30, height: 30 }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </STooltip>
        <SuggestCatalogRisksMasterConfigDialog
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          kind={configKind}
          sessionModel={sessionModelByKind[configKind]}
          onSessionModelChange={(value) =>
            setSessionModelByKind((current) => ({
              ...current,
              [configKind]: value,
            }))
          }
        />
      </>
    ) : null;

  const disabledReason = !selectedGho?.id
    ? 'Selecione uma entidade para sugerir riscos com IA.'
    : !context
      ? 'Vincule ao menos um estabelecimento para sugerir riscos com IA.'
      : '';

  return (
    <>
      <SFlex align="center" gap={2} sx={{ flexShrink: 0 }}>
        <STooltip
          withWrapper
          title={
            <Box sx={{ maxWidth: 330 }}>
              <Box component="strong" sx={{ display: 'block', mb: 3 }}>
                Sugerir riscos com IA
              </Box>
              {disabledReason ||
                'Abre o modal de sugestão de fatores do catálogo para o contexto selecionado. Você revisa e escolhe quais vincular, como em Adicionar riscos. Não preenche fontes geradoras, medidas de controle, recomendações ou probabilidades; para sugestões desses detalhes, use Análise geral com IA.'}
            </Box>
          }
        >
          <IconButton
            type="button"
            aria-label="Sugerir riscos com IA"
            disabled={!!disabledReason}
            onClick={() => setOpen(true)}
            sx={{
              width: 34,
              height: 34,
              border: '1px solid',
              borderColor: 'divider',
              color: 'primary.main',
            }}
          >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </STooltip>
        {masterConfigControl}
      </SFlex>
      {context && (
        <SuggestCatalogRisksWithAiDialog
          open={open}
          onClose={() => setOpen(false)}
          context={context}
          isSystemMaster={isSystemMaster}
          sessionModel={
            context.kind === 'gse'
              ? sessionModelByKind.gse
              : sessionModelByKind.characterization
          }
        />
      )}
    </>
  );
}
