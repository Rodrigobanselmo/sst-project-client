import { aiAnalyzeHierarchyRisk } from '@v2/services/security/hierarchy/ai-analyze-hierarchy-risk.service';
import type { RiskFactorAiSuggestionActions } from '../useRiskFactorAiSuggestionActions';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { isCurrentProbabilityLocked } from '../../components/SideRowTable/components/columns/ProbabilityColumn';
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import {
  selectUserPermissions,
  selectUserRoles,
} from 'store/reducers/user/userSlice';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';
import {
  queryRiskData,
  useRiskDataOperationWorkspaceId,
} from 'core/services/hooks/queries/useQueryRiskData';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { aiAnalyzeGse } from '@v2/services/security/homogeneous-group/ai-analyze-gse/service/ai-analyze-gse.service';
import { aiAnalyzeCharacterization } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.service';
import type { Result } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { useCharacterizationAiRiskAnalysisState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';
import {
  RiskFactorsAiProvider,
  RiskFactorsAiDisabled,
} from '../RiskFactorsAiProvider';
import { buildAiAnalyzeScopePayload } from '../risk-factors-ai-scope.util';
import {
  createRiskByOccurrenceAiSession,
  RiskByOccurrenceAiSession,
} from './risk-by-occurrence-ai-session.util';
import {
  AiRiskOccurrenceIdentity,
  aiRiskOccurrenceContextKey,
  createAiRiskOccurrenceIdentity,
} from './ai-risk-occurrence.identity';
import {
  AiRiskOccurrenceOwner,
  evaluateAiRiskOccurrence,
} from './ai-risk-occurrence-eligibility.util';
import {
  RiskByOccurrenceAiAdapter,
  RiskByOccurrenceAiCandidate,
} from './risk-by-occurrence-ai-adapter.types';

type ModalScope = {
  controller: RiskByOccurrenceAiSession;
  live: React.MutableRefObject<boolean>;
  companyId: string;
  workspaceId: string;
  canEdit: boolean;
  canAnalyzeGse: boolean;
  canAnalyzeHierarchy: boolean;
  canAnalyzeCharacterization: boolean;
};
const Context = createContext<ModalScope | null>(null);

/** Shared session boundary for by-risk analysis and the opt-in probability column in editors. */
export function RiskByRiskAiScope({
  riskId,
  riskGroupId,
  viewData,
  editorContext,
  children,
}: {
  riskId: string;
  riskGroupId: string;
  viewData: string;
  editorContext?: { companyId: string; workspaceId: string };
  children: React.ReactNode;
}) {
  const { companyId: routeCompanyId } = useGetCompanyId();
  const operationWorkspaceId = useRiskDataOperationWorkspaceId();
  const companyId = editorContext?.companyId ?? routeCompanyId;
  const workspaceId = editorContext?.workspaceId ?? operationWorkspaceId;
  const { workspaceId: headerWorkspaceId } = useTabWorkspaceId();
  const permissions = useAppSelector(selectUserPermissions);
  const roles = useAppSelector(selectUserRoles);
  const master =
    roles?.some((role) => role.split('-')[0] === RoleEnum.MASTER) ||
    permissions?.some(
      (permission) => permission.split('-')[0] === PermissionEnum.MASTER,
    );
  const access = (code: string, crud: string) =>
    !!permissions &&
    (master ||
      permissions.length === 0 ||
      permissions.some(
        (permission) =>
          permission.split('-')[0] === code &&
          [...crud].some((letter) =>
            permission.split('-')[1]?.includes(letter),
          ),
      ));
  const scopeKey = JSON.stringify([
    companyId,
    workspaceId,
    headerWorkspaceId,
    riskId,
    riskGroupId,
    viewData,
  ]);
  return (
    <ModalSession
      key={scopeKey}
      companyId={companyId || ''}
      workspaceId={workspaceId || ''}
      canEdit={
        !!workspaceId &&
        (!editorContext ||
          (companyId === routeCompanyId &&
            (!operationWorkspaceId || operationWorkspaceId === workspaceId))) &&
        (!headerWorkspaceId || headerWorkspaceId === workspaceId) &&
        access(PermissionEnum.RISK_DATA, 'cu')
      }
      canAnalyzeGse={access(PermissionEnum.HOMO_GROUP, 'c')}
      canAnalyzeHierarchy={access(PermissionEnum.HOMO_GROUP, 'cu')}
      canAnalyzeCharacterization={access(PermissionEnum.CHARACTERIZATION, 'c')}
    >
      {children}
    </ModalSession>
  );
}
function ModalSession({
  children,
  ...identity
}: Omit<ModalScope, 'controller' | 'live'> & { children: React.ReactNode }) {
  const [controller] = useState(createRiskByOccurrenceAiSession);
  const live = useRef(true);
  useLayoutEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      controller.activate(null);
    };
  }, [controller]);
  return (
    <Context.Provider value={{ ...identity, live, controller }}>
      {children}
    </Context.Provider>
  );
}

type OccurrenceProps = {
  gho: IGho;
  row: IRiskData;
  rows: IRiskData[];
  riskId: string;
  riskGroupId: string;
  disabled?: boolean;
  probabilityFallback?: RiskFactorAiSuggestionActions;
  hierarchy?: AiRiskOccurrenceOwner['hierarchy'];
  children: React.ReactNode;
};
export function RiskByRiskAiOccurrence(props: OccurrenceProps) {
  const modal = useContext(Context);
  if (!modal || props.disabled || !props.row.id || !modal.canEdit)
    return <RiskFactorsAiDisabled>{props.children}</RiskFactorsAiDisabled>;
  if (String(props.gho.type) === 'HIERARCHY')
    return modal.canAnalyzeHierarchy && props.hierarchy ? (
      <ValidatedOccurrence {...props} modal={modal} />
    ) : <RiskFactorsAiDisabled>{props.children}</RiskFactorsAiDisabled>;
  if (props.gho.type)
    return modal.canAnalyzeCharacterization ? (
      <CharacterizationOccurrence {...props} modal={modal} />
    ) : (
      <RiskFactorsAiDisabled>{props.children}</RiskFactorsAiDisabled>
    );
  return modal.canAnalyzeGse ? (
    <ValidatedOccurrence {...props} modal={modal} />
  ) : (
    <RiskFactorsAiDisabled>{props.children}</RiskFactorsAiDisabled>
  );
}
function CharacterizationOccurrence(
  props: OccurrenceProps & { modal: ModalScope },
) {
  const detail = useQueryCharacterization(props.gho.id, {
    companyId: props.modal.companyId,
    workspaceId: props.modal.workspaceId,
  });
  const element = detail.data;
  if (detail.isLoading || detail.isError || !element)
    return <RiskFactorsAiDisabled>{props.children}</RiskFactorsAiDisabled>;
  return (
    <ValidatedOccurrence
      {...props}
      characterization={{
        id: element.id,
        companyId: element.companyId,
        workspaceId: element.workspaceId,
        type: String(element.type),
        deleted_at: element.deleted_at,
      }}
    />
  );
}
function ValidatedOccurrence(
  props: OccurrenceProps & {
    modal: ModalScope;
    characterization?: AiRiskOccurrenceOwner['characterization'];
  },
) {
  const { modal, gho, row } = props;
  const identity = useMemo(() => {
    try {
      return createAiRiskOccurrenceIdentity({
        companyId: modal.companyId,
        workspaceId: modal.workspaceId,
        riskGroupId: props.riskGroupId,
        riskId: props.riskId,
        riskFactorDataId: row.id,
        ownerType: String(gho.type) === 'HIERARCHY' ? 'HIERARCHY' : gho.type ? 'CHARACTERIZATION' : 'GSE',
        ...(props.hierarchy ? { hierarchyId: props.hierarchy.id, hierarchyType: props.hierarchy.type } : {}),
        ownerId: gho.id,
      });
    } catch {
      return null;
    }
  }, [
    modal.companyId,
    modal.workspaceId,
    props.riskGroupId,
    props.riskId,
    row.id,
    gho.id,
    gho.type,
    props.hierarchy?.id,
    props.hierarchy?.type,
  ]);
  const owner: AiRiskOccurrenceOwner = {
    id: gho.id,
    companyId: gho.companyId,
    type: gho.type == null ? null : String(gho.type),
    status: gho.status,
    workspaceIds: [
      ...new Set([
        ...(gho.workspaceIds || []),
        ...(gho.workspaces || []).map((item) => item.id),
      ]),
    ],
    characterization: props.characterization,
    hierarchy: props.hierarchy,
  };
  const eligible =
    !!identity &&
    evaluateAiRiskOccurrence({
      identity,
      row,
      owner,
      siblings: props.rows,
      authorizedCompanyId: modal.companyId,
      canEdit: modal.canEdit,
    }).eligible;
  if (!identity || !eligible)
    return <RiskFactorsAiDisabled>{props.children}</RiskFactorsAiDisabled>;
  return (
    <OccurrenceProvider
      key={aiRiskOccurrenceContextKey(identity)}
      {...props}
      identity={identity}
      owner={owner}
    />
  );
}
function OccurrenceProvider({
  identity,
  owner,
  modal,
  row,
  rows,
  children,
  probabilityFallback,
}: OccurrenceProps & {
  identity: AiRiskOccurrenceIdentity;
  owner: AiRiskOccurrenceOwner;
  modal: ModalScope;
}) {
  const latest = useRef({ row, rows, owner });
  latest.current = { row, rows, owner };
  const analysis = useCharacterizationAiRiskAnalysisState(
    {},
    { identity, controller: modal.controller },
  );
  const responseGuards = useRef(new WeakMap<Result, () => boolean>());
  const adapter = useMemo<RiskByOccurrenceAiAdapter>(() => {
    const validate = (
      candidate: RiskByOccurrenceAiCandidate,
      siblings = latest.current.rows,
    ) =>
      modal.live.current &&
      evaluateAiRiskOccurrence({
        identity,
        row: candidate as IRiskData,
        owner: latest.current.owner,
        siblings,
        authorizedCompanyId: modal.companyId,
        canEdit: modal.canEdit,
      }).eligible;
    const activate = () => {
      if (modal.live.current) modal.controller.activate(identity);
    };
    const request = (
      payload: Parameters<typeof buildAiAnalyzeScopePayload>[0],
      signal?: AbortSignal,
      validateOnly?: boolean,
    ) =>
      identity.ownerType === 'HIERARCHY'
        ? aiAnalyzeHierarchyRisk({
            companyId: identity.companyId, workspaceId: identity.workspaceId,
            hierarchyId: identity.hierarchyId, hierarchyType: identity.hierarchyType,
            riskGroupId: identity.riskGroupId, riskFactorDataId: identity.riskFactorDataId,
            occurrence: identity, ...buildAiAnalyzeScopePayload(payload), signal,
            ...(validateOnly ? { validateOnly } : {}),
          })
        : identity.ownerType === 'GSE'
        ? aiAnalyzeGse({
            companyId: identity.companyId,
            workspaceId: identity.workspaceId,
            gseId: identity.ownerId,
            occurrence: identity,
            ...buildAiAnalyzeScopePayload(payload),
            signal,
            ...(validateOnly ? { validateOnly } : {}),
          })
        : aiAnalyzeCharacterization({
            companyId: identity.companyId,
            workspaceId: identity.workspaceId,
            characterizationId: identity.ownerId,
            occurrence: identity,
            ...buildAiAnalyzeScopePayload(payload),
            signal,
            ...(validateOnly ? { validateOnly } : {}),
          });
    const load = () =>
      queryRiskData(
        identity.companyId,
        identity.riskGroupId,
        identity.riskId,
        identity.workspaceId,
      );
    return {
      identity,
      row,
      activate,
      validate,
      canApproveProbability: (candidate) =>
        !candidate.isQuantity &&
        !isCurrentProbabilityLocked(
          candidate as IRiskData,
          identity.workspaceId,
        ),
      isResponseCurrent: (result) =>
        responseGuards.current.get(result)?.() === true,
      subscribeInactive: (close) =>
        modal.controller.subscribe(() => {
          if (!modal.controller.isActive(identity)) close();
        }),
      analyze: async (payload, signal) => {
        activate();
        const operation = modal.controller.startOperation();
        const cancel = () => {
          if (operation.isCurrent()) modal.controller.cancelOperation();
        };
        signal.addEventListener('abort', cancel, { once: true });
        if (signal.aborted) cancel();
        let result: Result | undefined;
        try {
          await modal.controller.run(
            operation,
            () => request(payload, operation.signal),
            (value) => {
              result = value;
              responseGuards.current.set(value, operation.isCurrent);
            },
          );
          if (!result || !operation.isCurrent()) {
            const error = new Error('Análise cancelada.');
            error.name = 'AbortError';
            throw error;
          }
          return result;
        } finally {
          signal.removeEventListener('abort', cancel);
        }
      },
      prepareAcceptance: (suggestion, candidate) => {
        if (
          !validate(candidate) ||
          (suggestion.field === 'probability' &&
            (candidate.isQuantity ||
              isCurrentProbabilityLocked(
                candidate as IRiskData,
                identity.workspaceId,
              )))
        )
          return null;
        activate();
        const lease = modal.controller.captureAcceptance(identity, suggestion);
        if (!lease) return null;
        return {
          isActive: () =>
            modal.live.current &&
            lease.isCurrent() &&
            validate(latest.current.row),
          beforeWrite: () =>
            modal.controller.canAccept(lease, async () => {
              const fresh = await load();
              const matching = fresh.filter(
                (item) => item.id === identity.riskFactorDataId,
              );
              if (
                matching.length !== 1 ||
                !validate(matching[0], fresh) ||
                (suggestion.field === 'probability' &&
                  (matching[0].isQuantity ||
                    isCurrentProbabilityLocked(
                      matching[0],
                      identity.workspaceId,
                    )))
              )
                return { eligible: false };
              const result = await request(
                { scope: 'risk', riskId: identity.riskId },
                undefined,
                true,
              );
              try {
                const metadata = result.metadata as
                  | Record<string, unknown>
                  | undefined;
                if (metadata?.occurrenceValidated !== true)
                  return { eligible: false };
                return {
                  eligible: true,
                  identity: createAiRiskOccurrenceIdentity(metadata.occurrence),
                };
              } catch {
                return { eligible: false };
              }
            }),
        };
      },
      readSavedRow: async () => {
        const fresh = await load();
        const matching = fresh.filter(
          (item) => item.id === identity.riskFactorDataId,
        );
        return matching.length === 1 && validate(matching[0], fresh)
          ? matching[0]
          : undefined;
      },
    };
  }, [identity, modal.controller, modal.companyId, modal.canEdit, modal.live]);
  // Supply the latest rendered row to the shared summary without changing the adapter callbacks.
  adapter.row = row;
  useLayoutEffect(
    () => () => {
      if (modal.controller.isActive(identity)) modal.controller.activate(null);
    },
    [modal.controller, identity],
  );
  const target =
    identity.ownerType === 'HIERARCHY'
      ? {
          kind: 'hierarchy' as const, companyId: identity.companyId, workspaceId: identity.workspaceId,
          hierarchyId: identity.hierarchyId, hierarchyType: identity.hierarchyType, riskGroupId: identity.riskGroupId, analysis,
        }
      : identity.ownerType === 'GSE'
      ? {
          kind: 'gse' as const,
          companyId: identity.companyId,
          workspaceId: identity.workspaceId,
          gseId: identity.ownerId,
          riskGroupId: identity.riskGroupId,
          analysis,
        }
      : {
          kind: 'characterization' as const,
          companyId: identity.companyId,
          workspaceId: identity.workspaceId,
          characterizationId: identity.ownerId,
          riskGroupId: identity.riskGroupId,
          analysis,
        };
  return (
    <RiskFactorsAiProvider
      target={target}
      individualOnly
      byRiskOccurrence={adapter}
      probabilityFallback={probabilityFallback}
    >
      {children}
    </RiskFactorsAiProvider>
  );
}
