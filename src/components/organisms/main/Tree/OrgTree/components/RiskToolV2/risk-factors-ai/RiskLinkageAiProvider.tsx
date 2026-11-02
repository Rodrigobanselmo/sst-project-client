import { EditorProbabilityAiScope } from './EditorProbabilityAiScope';
import React, { useEffect } from 'react';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';
import { Alert, Box } from '@mui/material';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { useCharacterizationAiRiskAnalysisState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';
import { RiskFactorsAiProvider } from './RiskFactorsAiProvider';
import {
  resolveRiskLinkageAiContext,
  riskLinkageAiContextKey,
  riskLinkageAiOccurrenceSignature,
  RiskLinkageAiContext,
  RiskFactorAiOccurrenceScope,
} from './risk-linkage-ai-context.util';

export function RiskLinkageAiProvider({
  companyId,
  riskGroupId,
  children,
}: {
  companyId: string;
  riskGroupId: string;
  children: React.ReactNode;
}) {
  const selected = useAppSelector((state) => state.gho.selected);
  const viewData = useAppSelector((state) => state.riskAdd.viewData);
  const { workspaceId } = useTabWorkspaceId();
  const { workspaceId: routeWorkspaceId } = useGetCompanyId();
  const entities = useQueryGHOAll(companyId || undefined);
  const hierarchies = useQueryHierarchies(companyId, {
    enabled: String(viewData) === 'SIMPLE_BY_GROUP',
  });
  const source =
    String(viewData) === 'SIMPLE_BY_GROUP' ? hierarchies : entities;
  const resolved = resolveRiskLinkageAiContext({
    companyId,
    riskGroupId,
    workspaceId,
    routeWorkspaceId,
    viewData: String(viewData),
    selectedEntityId: selected?.id,
    entities: entities.data || [],
    hierarchies: Object.values(hierarchies.data || {}),
  });
  if (!resolved.context && !resolved.message) return <>{children}</>;
  if (!resolved.context || source.isLoading || source.isError) {
    return (
      <LinkageFrame
        message={
          source.isError
            ? 'Não foi possível validar os vínculos para a análise com IA.'
            : resolved.message
        }
      >
        {children}
      </LinkageFrame>
    );
  }
  return (
    <ValidatedLinkageEntity
      key={riskLinkageAiContextKey(resolved.context)}
      context={resolved.context}
    >
      {children}
    </ValidatedLinkageEntity>
  );
}

function LinkageFrame({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {message && (
        <Alert severity="info" sx={{ mb: 1 }}>
          {message}
        </Alert>
      )}
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
}

function ValidatedLinkageEntity({
  context,
  children,
}: {
  context: RiskLinkageAiContext;
  children: React.ReactNode;
}) {
  return context.kind === 'characterization' ? (
    <ValidatedCharacterization context={context}>
      {children}
    </ValidatedCharacterization>
  ) : (
    <LinkageOccurrences context={context}>{children}</LinkageOccurrences>
  );
}

function ValidatedCharacterization({
  context,
  children,
}: {
  context: RiskLinkageAiContext;
  children: React.ReactNode;
}) {
  const detail = useQueryCharacterization(context.entityId, {
    companyId: context.companyId,
    workspaceId: context.workspaceId,
  });
  const entity = detail.data;
  if (
    detail.isLoading ||
    detail.isError ||
    !entity ||
    entity.id !== context.entityId ||
    entity.companyId !== context.companyId ||
    entity.workspaceId !== context.workspaceId ||
    entity.deleted_at
  ) {
    return (
      <LinkageFrame
        message={
          detail.isLoading
            ? 'Validando a caracterização para a análise com IA…'
            : 'Não foi possível validar a caracterização neste estabelecimento. Selecione um vínculo válido.'
        }
      >
        {children}
      </LinkageFrame>
    );
  }
  return <LinkageOccurrences context={context}>{children}</LinkageOccurrences>;
}

function LinkageOccurrences({
  context,
  children,
}: {
  context: RiskLinkageAiContext;
  children: React.ReactNode;
}) {
  const rows = useQueryRiskDataByGho(context.riskGroupId, context.entityId);
  if (rows.isLoading || rows.isError) {
    return (
      <LinkageFrame
        message={
          rows.isError
            ? 'Não foi possível validar as ocorrências para a análise com IA.'
            : undefined
        }
      >
        {children}
      </LinkageFrame>
    );
  }
  const signature = riskLinkageAiOccurrenceSignature(rows.data || []);
  return (
    <ScopedLinkageAi
      key={signature}
      scope={{ context, rows: rows.data || [] }}
      signature={signature}
    >
      {children}
    </ScopedLinkageAi>
  );
}

function ScopedLinkageAi({
  scope,
  signature,
  children,
}: {
  scope: RiskFactorAiOccurrenceScope;
  signature: string;
  children: React.ReactNode;
}) {
  const { context } = scope;
  useEffect(() => {
    // A first direct link can persist the hierarchy's typed owner after the GHO cache was loaded.
    if (context.kind === 'hierarchy' && scope.rows.length > 0)
      void queryClient.invalidateQueries([QueryEnum.GHO, context.companyId]);
  }, [context.kind, context.companyId, context.entityId, signature, scope.rows.length]);
  const analysis = useCharacterizationAiRiskAnalysisState({
    companyId: context.companyId,
    workspaceId: context.workspaceId,
    riskGroupId: context.riskGroupId,
    ...(context.kind === 'hierarchy'
      ? { hierarchyId: context.entityId, hierarchyType: context.hierarchyType }
      : context.kind === 'gse'
        ? { gseId: context.entityId }
        : { characterizationId: context.entityId }),
    sessionNamespace: 'risk-linkage-v1',
    occurrenceSignature: signature,
  });
  const target =
    context.kind === 'hierarchy'
      ? {
          kind: 'hierarchy' as const,
          companyId: context.companyId,
          workspaceId: context.workspaceId,
          hierarchyId: context.entityId,
          hierarchyType: context.hierarchyType!,
          riskGroupId: context.riskGroupId,
          analysis,
        }
      : context.kind === 'gse'
        ? {
            kind: 'gse' as const,
            companyId: context.companyId,
            workspaceId: context.workspaceId,
            gseId: context.entityId,
            riskGroupId: context.riskGroupId,
            analysis,
          }
        : {
            kind: 'characterization' as const,
            companyId: context.companyId,
            workspaceId: context.workspaceId,
            characterizationId: context.entityId,
            riskGroupId: context.riskGroupId,
            analysis,
          };
  return (
    <RiskFactorsAiProvider
      target={target}
      individualOnly
      occurrenceScope={scope}
    >
      <EditorProbabilityAiScope
        jointWorkspaceScoped
        kind={context.kind === 'hierarchy' ? 'HIERARCHY' : context.kind === 'gse' ? 'GSE' : 'CHARACTERIZATION'}
        companyId={context.companyId} workspaceId={context.workspaceId}
        riskGroupId={context.riskGroupId} ownerId={context.entityId} hierarchyType={context.hierarchyType}
      >
        {children}
      </EditorProbabilityAiScope>
    </RiskFactorsAiProvider>
  );
}
