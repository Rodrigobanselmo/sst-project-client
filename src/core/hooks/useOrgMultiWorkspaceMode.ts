import { useRouter } from 'next/router';

import { isOrgHierarquiaMultiWorkspace } from 'core/utils/org-workspace-query';

/** Hierarquia com 2+ estabelecimentos: só visualização, sem contexto SST único. */
export function useOrgMultiWorkspaceMode() {
  const { pathname, query } = useRouter();
  return isOrgHierarquiaMultiWorkspace(pathname, query);
}
