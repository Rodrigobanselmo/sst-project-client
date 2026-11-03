/** Environment selection belongs to the platform master role, not ordinary
 * eSocial CRUD grants. A stale test selection must never carry into a customer
 * session. Existing test artifacts remain identifiable in the history. */
export function canChooseEsocialEnvironment(roles: readonly string[] = []) {
  return roles.some((role) => role.split('-')[0] === 'master');
}
export function esocialEnvironment(canChoose: boolean, selected: 1 | 2): 1 | 2 {
  return canChoose ? selected : 1;
}
export function canOperateEsocialEnvironment(
  canChoose: boolean,
  environment: number,
) {
  return environment === 1 || (canChoose && environment === 2);
}
