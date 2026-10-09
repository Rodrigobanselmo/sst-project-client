export type ModalStackEntry<T = unknown> = {
  name: string;
  data?: T;
};

/**
 * Abre o modal no topo da pilha. Se ele já estiver aberto, troca só o payload,
 * para um novo rascunho substituir o fator que estava em edição.
 */
export function nextModalStack<T>(
  current: ModalStackEntry<T>[],
  pile: ModalStackEntry<T>[],
  name: string,
  data?: T,
): { current: ModalStackEntry<T>[]; pile: ModalStackEntry<T>[] } {
  const isOpen = current.some((modal) => modal.name === name);

  if (!isOpen) {
    return {
      current: [...current, { name, data }],
      pile: [...pile, { name, data }],
    };
  }

  const replace = (entries: ModalStackEntry<T>[]) =>
    entries.map((entry) => (entry.name === name ? { ...entry, data } : entry));

  return {
    current: replace(current),
    pile: replace(pile),
  };
}
