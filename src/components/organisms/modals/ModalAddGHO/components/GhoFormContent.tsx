/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Wizard } from 'react-use-wizard';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import { Box } from '@mui/material';
import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { HierarchyHomoTable } from 'components/organisms/tables/HierarchyHomoTable/HierarchyHomoTable';
import { useRouter } from 'next/router';

import { IdsEnum } from 'core/enums/ids.enums';
import { getSaveActionColor } from 'core/utils/save-action-color';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import {
  Control,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormSetValue,
} from 'react-hook-form';

import { EditGhoSelects } from './EditGhoSelects';
import { GhoAiAnalysisContent } from './GhoAiAnalysisContent';
import { RiskToolForGse } from './RiskToolForGse';
import { ApplyGseWizardStep } from './ApplyGseWizardStep';
import { initialAddGhoState } from '../hooks/useAddGho';
import {
  clampGseWizardStep,
  getGseWizardTabOptions,
  GSE_WIZARD_STEP,
  GSE_WIZARD_STEP_QUERY_KEY,
  GSE_WIZARD_TAB_LABELS,
  resolveGseWizardStepFromQuery,
} from '../gse-wizard-steps';
import { GhoSaveIntent } from '../gho-save-intent.util';
import { getGseLinkedWorkspaceIds } from '../get-gse-linked-workspace-ids.util';

export type GhoAddLayout = 'modal' | 'page';

type GhoFormContentProps = {
  layout: GhoAddLayout;
  ghoData: typeof initialAddGhoState;
  ghoQuery: IGho;
  setGhoData: React.Dispatch<React.SetStateAction<typeof initialAddGhoState>>;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  onSubmit: SubmitHandler<{ name: string; description: string }>;
  onCloseUnsaved: () => void;
  onRemove: () => void;
  onAddHierarchy: () => void;
  hierarchies: IHierarchy[];
  loadingQuery: boolean;
  loading: boolean;
  isDirty?: boolean;
  setSaveIntent?: (intent: GhoSaveIntent) => void;
};

export const GhoFormContent = ({
  layout,
  ghoData,
  ghoQuery,
  setGhoData,
  control,
  setValue,
  handleSubmit,
  onSubmit,
  onCloseUnsaved,
  onRemove,
  onAddHierarchy,
  hierarchies,
  loadingQuery,
  loading,
  isDirty = false,
  setSaveIntent,
}: GhoFormContentProps) => {
  const router = useRouter();
  const { data: company } = useQueryCompany();
  const companyId = router.query.companyId as string;
  const preferredWorkspaceId = String(
    router.query.tabWorkspaceId || router.query.workspaceId || '',
  );
  const gseWorkspaceIds = getGseLinkedWorkspaceIds(ghoData, ghoQuery);
  const workspaceNamesById = (company?.workspace || []).reduce(
    (acc, workspace) => {
      acc[workspace.id] = workspace.name;
      return acc;
    },
    {} as Record<string, string>,
  );
  const title = ghoData.id ? 'Editar GSE' : 'Grupo similar de exposição';
  const gseName = (ghoData.name || ghoQuery?.name || '').trim();
  const headerContextName = ghoData.id && gseName ? gseName : undefined;
  const exitLabel = ghoData.id ? 'Salvar e Sair' : 'Criar';
  const isPage = layout === 'page';
  const isEdit = !!ghoData.id;
  const saveActionColor = getSaveActionColor(isDirty);
  const risksTabDisabled = !isEdit;
  const returnWizardStep = resolveGseWizardStepFromQuery({
    ghoId: ghoData.id,
    queryGhoId: router.query.ghoId,
    queryStep: router.query[GSE_WIZARD_STEP_QUERY_KEY],
  });
  const requestedStep = isPage
    ? (returnWizardStep ?? clampGseWizardStep(ghoData.initialWizardStep))
    : GSE_WIZARD_STEP.DATA;
  const canApplyInitialStep = isPage && isEdit;
  const wizardTabsOptions = getGseWizardTabOptions({
    layout,
    isEdit,
  }).map((option) =>
    option.label === GSE_WIZARD_TAB_LABELS.AI_ANALYSIS
      ? {
          ...option,
          icon: (
            <AutoFixHighOutlinedIcon
              sx={{ fontSize: 16, color: 'primary.main' }}
            />
          ),
          iconPosition: 'start' as const,
        }
      : option,
  );

  const wizard = (
    <Wizard
      startIndex={canApplyInitialStep ? requestedStep : GSE_WIZARD_STEP.DATA}
      header={
        <>
          <ApplyGseWizardStep
            requestedStep={
              canApplyInitialStep
                ? (returnWizardStep ?? ghoData.initialWizardStep)
                : undefined
            }
            enabled={canApplyInitialStep}
          />
          <WizardTabs
            shadow
            {...(isPage && {
              onChangeTab: (index, cb) =>
                risksTabDisabled && index >= GSE_WIZARD_STEP.RISKS
                  ? undefined
                  : cb(index),
            })}
            options={wizardTabsOptions}
          />
        </>
      }
    >
      <Box sx={{ px: isPage ? 0 : 2, pt: 6, pb: 4 }}>
        <SFlex gap={8} direction="column">
          <InputForm
            setValue={setValue}
            autoFocus
            defaultValue={ghoData.name}
            minRows={2}
            maxRows={4}
            label="Nome"
            control={control}
            sx={{ width: '100%' }}
            placeholder="nome do GSE..."
            name="name"
            size="small"
          />
          <InputForm
            multiline
            defaultValue={ghoData.description || ghoQuery.description}
            minRows={2}
            setValue={setValue}
            maxRows={4}
            label="Descrição"
            control={control}
            sx={{ width: '100%' }}
            placeholder="descrição do GSE..."
            name="description"
            size="small"
          />
          <EditGhoSelects
            ghoQuery={ghoQuery}
            ghoData={ghoData}
            setGhoData={setGhoData}
          />
        </SFlex>
      </Box>

      <Box sx={{ px: isPage ? 0 : 2, pt: 6, pb: 4 }}>
        <HierarchyHomoTable
          onAdd={onAddHierarchy}
          loading={loadingQuery}
          hierarchies={hierarchies as any}
          groupByWorkspace
          preferredWorkspaceId={preferredWorkspaceId || undefined}
          gseWorkspaceIds={gseWorkspaceIds}
          workspaceNamesById={workspaceNamesById}
        />
      </Box>

      {isPage && (
        <Box sx={{ px: 0, pb: 4 }}>
          {!isEdit ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <SText variant="body1" textAlign="center">
                Salve o GSE antes de vincular fatores de risco.
              </SText>
            </Box>
          ) : (
            <RiskToolForGse
              companyId={companyId}
              ghoId={ghoData.id}
              ghoName={ghoData.name || ghoQuery.name}
              gho={ghoQuery?.id ? (ghoQuery as IGho) : null}
            />
          )}
        </Box>
      )}
      {isPage && (
        <GhoAiAnalysisContent
          companyId={companyId}
          ghoData={ghoData}
          ghoQuery={ghoQuery}
        />
      )}
    </Wizard>
  );

  if (isPage) {
    return (
      <Box
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        <SFlex
          align="flex-start"
          justify="space-between"
          gap={3}
          flexWrap="wrap"
          sx={{ flexShrink: 0, mb: 4 }}
        >
          <SPageHeader
            mb={0}
            title={title}
            contextName={headerContextName}
            onBack={onCloseUnsaved}
          />
          <SFlex
            align="center"
            gap={3}
            flexWrap="wrap"
            justifyContent="flex-end"
            sx={{ flexShrink: 0 }}
          >
            {ghoData.id && (
              <SButton variant="outlined" onClick={onRemove}>
                Excluir
              </SButton>
            )}
            <SButton
              variant="outlined"
              style={{ minWidth: 100 }}
              id={IdsEnum.CANCEL_BUTTON}
              onClick={onCloseUnsaved}
            >
              Cancelar
            </SButton>
            <SButton
              variant="outlined"
              type="submit"
              color={saveActionColor}
              style={{ minWidth: 100 }}
              loading={loading}
              disabled={loading}
              onClick={() => {
                setSaveIntent?.('stay');
                setGhoData({ ...ghoData });
              }}
            >
              Salvar
            </SButton>
            <SButton
              variant="contained"
              type="submit"
              color={saveActionColor}
              style={{ minWidth: 100 }}
              loading={loading}
              disabled={loading}
              onClick={() => {
                setSaveIntent?.('exit');
                setGhoData({ ...ghoData });
              }}
            >
              {exitLabel}
            </SButton>
          </SFlex>
        </SFlex>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 0.5,
          }}
        >
          {wizard}
        </Box>
      </Box>
    );
  }

  return <Box mt={6}>{wizard}</Box>;
};
