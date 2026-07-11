const lastTabWorkspaceKey = (companyId: string) =>
  `LAST_CHAR_TAB_WORKSPACE_${companyId}`;

const allEstablishmentsSessionKey = (companyId: string) =>
  `CHAR_TAB_WORKSPACE_ALL_${companyId}`;

export function loadLastCharacterizationTabWorkspaceId(
  companyId: string,
): string | undefined {
  if (typeof window === 'undefined' || !companyId) return undefined;
  try {
    const value = localStorage.getItem(lastTabWorkspaceKey(companyId));
    return value || undefined;
  } catch {
    return undefined;
  }
}

export function saveLastCharacterizationTabWorkspaceId(
  companyId: string,
  workspaceId: string,
): void {
  if (typeof window === 'undefined' || !companyId || !workspaceId) return;
  try {
    localStorage.setItem(lastTabWorkspaceKey(companyId), workspaceId);
  } catch {
    // ignore quota / private mode
  }
}

/** Sessão: usuário escolheu explicitamente “Todos os estabelecimentos”. */
export function loadCharacterizationAllEstablishmentsChoice(
  companyId: string,
): boolean {
  if (typeof window === 'undefined' || !companyId) return false;
  try {
    return sessionStorage.getItem(allEstablishmentsSessionKey(companyId)) === '1';
  } catch {
    return false;
  }
}

export function saveCharacterizationAllEstablishmentsChoice(
  companyId: string,
  choseAll: boolean,
): void {
  if (typeof window === 'undefined' || !companyId) return;
  try {
    const key = allEstablishmentsSessionKey(companyId);
    if (choseAll) sessionStorage.setItem(key, '1');
    else sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}
