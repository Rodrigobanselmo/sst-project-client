import type { IGho } from 'core/interfaces/api/IGho';

/**
 * Payload accepted by ModalEnum.GHO_ADD / useAddGho (same shape as GhosTable onEditGHO).
 * Pure helper — used by Assistente “Abrir GSE”.
 */
export type OpenGseModalPayload = {
  id: string;
  name: string;
  description: string;
  companyId: string;
  status: IGho['status'];
  workspaceIds: string[];
  workspaces: NonNullable<IGho['workspaces']>;
  hierarchies: [];
  layout: 'modal';
};

export function buildOpenGseModalPayload(params: {
  gho: Pick<IGho, 'id' | 'name' | 'description' | 'status' | 'workspaceIds' | 'workspaces'>;
  companyId: string;
}): OpenGseModalPayload {
  return {
    id: params.gho.id,
    name: params.gho.name ?? '',
    description: params.gho.description ?? '',
    companyId: params.companyId,
    status: params.gho.status,
    workspaceIds: params.gho.workspaceIds ?? [],
    workspaces: params.gho.workspaces ?? [],
    hierarchies: [],
    layout: 'modal',
  };
}

export function resolveImplementedProposalCopy(
  status: 'EXACT_CREATED_PROPOSAL' | 'EXACT_EXISTING_GSE' | string,
): { badge: string; explanation: string } {
  if (status === 'EXACT_CREATED_PROPOSAL') {
    return {
      badge: 'GSE criado',
      explanation: 'Criado a partir desta proposta pelo Assistente de GSE.',
    };
  }
  if (status === 'EXACT_EXISTING_GSE') {
    return {
      badge: 'Atendida por GSE existente',
      explanation: 'Já existe um GSE com composição equivalente à proposta.',
    };
  }
  return {
    badge: 'Implementada',
    explanation: 'Esta proposta já foi implementada como Grupo Similar de Exposição.',
  };
}
