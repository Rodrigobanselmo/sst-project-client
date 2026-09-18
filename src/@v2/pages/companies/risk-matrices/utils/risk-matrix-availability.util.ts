import type { MatrixWorkspaceAvailabilityWorkspace } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

export function describeWorkspaceAvailability(
  workspace: MatrixWorkspaceAvailabilityWorkspace,
) {
  if (workspace.action === 'disable' && workspace.enabledVersionNumber != null) {
    return `Habilitada (v${workspace.enabledVersionNumber})`;
  }
  if (workspace.action === 'switch' && workspace.enabledVersionNumber != null) {
    return `Habilitada na v${workspace.enabledVersionNumber}. Há uma versão publicada mais recente.`;
  }
  if (workspace.action === 'blocked') {
    if (workspace.enabled && workspace.enabledVersionNumber != null) {
      return `Habilitada na v${workspace.enabledVersionNumber}. A versão publicada atual conflita com outra matriz.`;
    }
    return 'Coberturas ocupadas por outra matriz customizada.';
  }
  if (workspace.action === 'unavailable') {
    return 'Não é possível disponibilizar nesta identidade.';
  }
  return 'Livre para disponibilizar a versão completa.';
}
