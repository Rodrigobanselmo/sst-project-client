import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import React, { createContext, useContext } from 'react';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import type { IRiskData } from 'core/interfaces/api/IRiskData';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import {
  RiskByRiskAiScope,
  RiskByRiskAiOccurrence,
} from './by-risk-occurrence/RiskByRiskAiScope';
import {
  RiskFactorAiOccurrenceBoundary,
  RiskFactorsAiDisabled,
  useRiskFactorsAiOptional,
} from './RiskFactorsAiProvider';

type Editor = {
  companyId: string;
  ownerId: string;
  riskGroupId: string;
  kind: 'GSE' | 'CHARACTERIZATION' | 'HIERARCHY';
  hierarchyType?: string;
  jointWorkspaceScoped?: boolean;
  workspaceId?: string;
};
const Context = createContext<Editor | null>(null);

/** Opt-in probability column in editors and linkage; existing providers own all other columns. */
export function EditorProbabilityAiScope({
  children,
  ...editor
}: Editor & { children: React.ReactNode }) {
  const { workspaceId: selectedWorkspace } = useTabWorkspaceId();
  const workspaceId =
    editor.kind === 'CHARACTERIZATION' ? editor.workspaceId : selectedWorkspace;
  return (
    <RiskByRiskAiScope
      riskId=""
      riskGroupId={editor.riskGroupId}
      viewData={`probability-editor:${editor.ownerId}`}
      editorContext={{
        companyId: editor.companyId,
        workspaceId: workspaceId || '',
      }}
    >
      <Context.Provider value={editor}>{children}</Context.Provider>
    </RiskByRiskAiScope>
  );
}

export function EditorProbabilityAiBoundary({
  data,
  children,
}: {
  data?: Partial<IRiskData>;
  children: React.ReactNode;
}) {
  const editor = useContext(Context);
  return editor ? (
    <EditorOccurrence editor={editor} data={data}>
      {children}
    </EditorOccurrence>
  ) : (
    <>{children}</>
  );
}
function EditorOccurrence({
  editor,
  data,
  children,
}: {
  editor: Editor;
  data?: Partial<IRiskData>;
  children: React.ReactNode;
}) {
  const parent = useRiskFactorsAiOptional();
  const { companyId } = useGetCompanyId();
  const enabled = !!parent && companyId === editor.companyId;
  const owners = useQueryGHOAll(editor.companyId, undefined, { enabled });
  const query = useQueryRiskDataByGho(editor.riskGroupId, editor.ownerId, {
    enabled,
  });
  const nodes = useQueryHierarchies(editor.companyId, {
    enabled: enabled && editor.kind === 'HIERARCHY',
  });
  const node = nodes.data?.[editor.ownerId];
  const owner = owners.data?.find((item) => item.id === editor.ownerId);
  const matching =
    query.data?.filter(
      (item) => item.id === data?.id && item.riskId === data?.riskId,
    ) || [];
  if (
    !parent ||
    companyId !== editor.companyId ||
    query.isLoading ||
    query.isError ||
    owners.isError ||
    !owner ||
    matching.length !== 1 ||
    (editor.kind === 'HIERARCHY'
      ? String(owner.type) !== 'HIERARCHY' ||
        nodes.isLoading ||
        nodes.isError ||
        !node ||
        String(node.type) !== editor.hierarchyType
      : editor.kind === 'GSE'
        ? !!owner.type
        : !['ENVIRONMENT', 'ACTIVITIES', 'EQUIPMENT', 'WORKSTATION'].includes(
            String(owner.type),
          ))
  ) {
    return <RiskFactorsAiDisabled>{children}</RiskFactorsAiDisabled>;
  }
  const row = matching[0];
  const linkedWorkspaces = new Set([
    ...(owner.workspaceIds || []),
    ...(owner.workspaces || []).map((workspace) => workspace.id),
  ]);
  // Legacy joint sessions of shared GSEs do not identify the originating workspace.
  // Keep their history, but never import ambiguous evidence into this occurrence.
  const canReuseJoint =
    editor.jointWorkspaceScoped ||
    editor.kind !== 'GSE' ||
    linkedWorkspaces.size === 1;
  return (
    <RiskByRiskAiOccurrence
      gho={owner}
      row={row}
      rows={query.data || []}
      riskId={row.riskId}
      riskGroupId={editor.riskGroupId}
      probabilityFallback={canReuseJoint ? parent.suggestions : undefined}
      hierarchy={
        editor.kind === 'HIERARCHY' && node
          ? {
              id: node.id,
              companyId: node.companyId,
              type: String(node.type),
              status: String(node.status),
              workspaceIds: [
                ...new Set([
                  ...(node.workspaceIds || []),
                  ...(node.workspaces || []).map((workspace) => workspace.id),
                ]),
              ],
            }
          : undefined
      }
    >
      <RiskFactorAiOccurrenceBoundary riskData={row}>
        {children}
      </RiskFactorAiOccurrenceBoundary>
    </RiskByRiskAiOccurrence>
  );
}
