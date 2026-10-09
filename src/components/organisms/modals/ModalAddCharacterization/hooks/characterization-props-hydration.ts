export type CharacterizationPropsHydrationSource = {
  id?: string;
  companyId?: string;
  workspaceId?: string;
  name?: string;
  description?: string;
  type?: string;
  passBack?: boolean;
};

export type CharacterizationPropsHydrationDecision = {
  /** ignore: nada a fazer. skip: esta chave já foi tratada. settle: conclui sem novo setState. apply: grava estado e formulário. */
  action: 'ignore' | 'skip' | 'settle' | 'apply';
  nextMark: string;
};

const IDENTITY_PREFIX = 'identity:';
const COMPLETE_PREFIX = 'complete:';

export function characterizationPropsHydrationKey(
  data?: Pick<
    CharacterizationPropsHydrationSource,
    'id' | 'companyId' | 'workspaceId'
  > | null,
) {
  return [data?.id || '', data?.companyId || '', data?.workspaceId || ''].join(
    '::',
  );
}

function parseHydrationMark(mark: string) {
  if (mark.startsWith(COMPLETE_PREFIX)) {
    return { phase: 'complete' as const, key: mark.slice(COMPLETE_PREFIX.length) };
  }
  if (mark.startsWith(IDENTITY_PREFIX)) {
    return { phase: 'identity' as const, key: mark.slice(IDENTITY_PREFIX.length) };
  }
  return { phase: 'idle' as const, key: '' };
}

/**
 * Decide se a hidratação por props/lista deve escrever estado.
 * A lista ausente permite uma única gravação de identidade.
 * A conclusão ocorre uma vez por id + empresa + estabelecimento,
 * mesmo quando o registro não vem na lista.
 */
export function decideCharacterizationPropsHydration(params: {
  hasInitialData: boolean;
  profileParentId?: string;
  listFetched: boolean;
  hydrationMark: string;
  initialData?: CharacterizationPropsHydrationSource | null;
  foundId?: string | null;
}): CharacterizationPropsHydrationDecision {
  const unchanged = {
    action: 'ignore' as const,
    nextMark: params.hydrationMark,
  };
  if (
    !params.hasInitialData ||
    params.profileParentId ||
    params.initialData?.passBack
  ) {
    return unchanged;
  }

  const key = characterizationPropsHydrationKey(params.initialData);
  const { phase, key: markedKey } = parseHydrationMark(params.hydrationMark);
  const sameKey = markedKey === key;
  const needsList = Boolean(params.initialData?.id);

  if (sameKey && phase === 'complete') {
    return { action: 'skip', nextMark: params.hydrationMark };
  }

  if (needsList && !params.listFetched) {
    if (sameKey && phase === 'identity') {
      return { action: 'skip', nextMark: params.hydrationMark };
    }
    return { action: 'apply', nextMark: `${IDENTITY_PREFIX}${key}` };
  }

  if (sameKey && phase === 'identity' && !params.foundId) {
    return { action: 'settle', nextMark: `${COMPLETE_PREFIX}${key}` };
  }

  return { action: 'apply', nextMark: `${COMPLETE_PREFIX}${key}` };
}
