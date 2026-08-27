/**
 * Marca itens já vinculados (`selected`) e, se pedido, coloca-os no topo.
 * Compara por id estável (string), sem inferir pelo texto.
 */
export type ApplyLockedSelectedStateOptions = {
  lockSelected?: boolean;
  preserveOptionOrder?: boolean;
};

export function optionValueIsSelected(
  value: unknown,
  selectedIds: Array<string | number> | undefined,
): boolean {
  if (value == null || !selectedIds?.length) return false;
  const id = String(value);
  return selectedIds.some((selected) => String(selected) === id);
}

export function applyLockedSelectedState(
  options: any[],
  selectedIds: Array<string | number> | undefined,
  valueField: string,
  flags: ApplyLockedSelectedStateOptions = {},
): any[] {
  if (!selectedIds?.length) return options;

  const selected = new Set(selectedIds.map((id) => String(id)));
  const decorate = (option: any) => {
    if (!selected.has(String(option?.[valueField] ?? ''))) return option;
    return {
      ...option,
      checked: true,
      ...(flags.lockSelected ? { locked: true } : {}),
    };
  };

  if (flags.preserveOptionOrder) return options.map(decorate);

  const locked: any[] = [];
  const rest: any[] = [];
  for (const option of options) {
    if (selected.has(String(option?.[valueField] ?? ''))) {
      locked.push(decorate(option));
    } else {
      rest.push(option);
    }
  }
  return [...locked, ...rest];
}

export function sortByOptionOrder(
  items: any[],
  ordered: any[],
  valueField: string,
): any[] {
  const order = new Map(
    ordered.map((option, index) => [String(option?.[valueField] ?? ''), index]),
  );
  return [...items].sort((a, b) => {
    const aIndex =
      order.get(String(a?.[valueField] ?? '')) ?? Number.MAX_SAFE_INTEGER;
    const bIndex =
      order.get(String(b?.[valueField] ?? '')) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}
