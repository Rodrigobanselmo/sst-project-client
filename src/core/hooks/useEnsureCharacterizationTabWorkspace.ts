import { useEffect, useMemo, useRef, useState } from 'react';

import { WorkspaceStatusEnum } from '@v2/models/enterprise/enums/workspace-status.enum';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useRouter } from 'next/router';

import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import {
  loadCharacterizationAllEstablishmentsChoice,
  loadLastCharacterizationTabWorkspaceId,
  saveCharacterizationAllEstablishmentsChoice,
  saveLastCharacterizationTabWorkspaceId,
} from 'core/utils/helpers/characterization-tab-workspace.storage';
import {
  enrichPickableWorkspaces,
  pickDefaultWorkspace,
} from 'core/utils/helpers/pick-default-workspace.util';

const ALL = 'ALL' as const;

type BootstrappedWorkspace = string | typeof ALL;

type UseEnsureCharacterizationTabWorkspaceParams = {
  companyId?: string;
  /** Workspaces da empresa (para isOwner / enriquecimento), se disponíveis. */
  companyWorkspaces?: IWorkspace[];
  enabled?: boolean;
};

/**
 * No stage SST/Caracterização: garante estabelecimento padrão na entrada
 * (último usado → pickDefaultWorkspace), sem sobrescrever URL existente.
 * “Todos” (limpar tabWorkspaceId) é escolha explícita e fica na sessionStorage.
 */
export function useEnsureCharacterizationTabWorkspace({
  companyId,
  companyWorkspaces,
  enabled = true,
}: UseEnsureCharacterizationTabWorkspaceParams) {
  const router = useRouter();
  const { workspaceId: urlWorkspaceId, setWorkspaceId } = useTabWorkspaceId();

  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId: companyId || '',
  });

  const [bootstrapped, setBootstrapped] = useState<BootstrappedWorkspace | null>(
    null,
  );
  const previousUrlWorkspaceIdRef = useRef<string | undefined>(undefined);

  const defaultWorkspaceId = useMemo(() => {
    const activeResults = workspaces?.results?.filter(
      (workspace) => workspace.status === WorkspaceStatusEnum.ACTIVE,
    );
    const source =
      activeResults?.length && activeResults.length > 0
        ? activeResults
        : workspaces?.results;

    const pickable = enrichPickableWorkspaces(source, companyWorkspaces);
    return pickDefaultWorkspace(pickable);
  }, [companyWorkspaces, workspaces?.results]);

  const availableIds = useMemo(() => {
    return new Set(workspaces?.results?.map((workspace) => workspace.id));
  }, [workspaces?.results]);

  // Bootstrap inicial.
  useEffect(() => {
    if (!enabled) return;
    if (!router.isReady || !companyId) return;
    if (bootstrapped !== null) return;

    if (urlWorkspaceId) {
      saveCharacterizationAllEstablishmentsChoice(companyId, false);
      saveLastCharacterizationTabWorkspaceId(companyId, urlWorkspaceId);
      previousUrlWorkspaceIdRef.current = urlWorkspaceId;
      setBootstrapped(urlWorkspaceId);
      return;
    }

    if (loadCharacterizationAllEstablishmentsChoice(companyId)) {
      previousUrlWorkspaceIdRef.current = undefined;
      setBootstrapped(ALL);
      return;
    }

    if (isLoadingAllWorkspaces) return;

    const lastId = loadLastCharacterizationTabWorkspaceId(companyId);
    const preferred =
      (lastId && availableIds.has(lastId) ? lastId : undefined) ||
      defaultWorkspaceId;

    if (preferred) {
      saveCharacterizationAllEstablishmentsChoice(companyId, false);
      saveLastCharacterizationTabWorkspaceId(companyId, preferred);
      // Ainda sem URL: não marcar previousUrl para não confundir com “Todos”.
      setBootstrapped(preferred);
      setWorkspaceId(preferred);
      return;
    }

    setBootstrapped(ALL);
  }, [
    availableIds,
    bootstrapped,
    companyId,
    defaultWorkspaceId,
    enabled,
    isLoadingAllWorkspaces,
    router.isReady,
    setWorkspaceId,
    urlWorkspaceId,
  ]);

  // Após bootstrap: acompanhar troca de estabelecimento / “Todos” no header.
  useEffect(() => {
    if (!enabled || !companyId || bootstrapped === null) return;
    if (!router.isReady) return;

    const previousUrl = previousUrlWorkspaceIdRef.current;

    if (urlWorkspaceId) {
      previousUrlWorkspaceIdRef.current = urlWorkspaceId;
      if (bootstrapped !== urlWorkspaceId) {
        setBootstrapped(urlWorkspaceId);
      }
      saveCharacterizationAllEstablishmentsChoice(companyId, false);
      saveLastCharacterizationTabWorkspaceId(companyId, urlWorkspaceId);
      return;
    }

    // URL vazia só vira “Todos” se o usuário limpou um valor que já estava na URL.
    if (previousUrl) {
      previousUrlWorkspaceIdRef.current = undefined;
      saveCharacterizationAllEstablishmentsChoice(companyId, true);
      if (bootstrapped !== ALL) {
        setBootstrapped(ALL);
      }
    }
  }, [bootstrapped, companyId, enabled, router.isReady, urlWorkspaceId]);

  const isWorkspaceFilterReady = !enabled || bootstrapped !== null;

  const workspaceId = !enabled
    ? urlWorkspaceId
    : bootstrapped === null || bootstrapped === ALL
      ? undefined
      : bootstrapped;

  return {
    workspaceId,
    urlWorkspaceId,
    isWorkspaceFilterReady,
    isLoadingWorkspaces: isLoadingAllWorkspaces,
    setWorkspaceId,
    isAllEstablishments: enabled && bootstrapped === ALL,
  };
}
