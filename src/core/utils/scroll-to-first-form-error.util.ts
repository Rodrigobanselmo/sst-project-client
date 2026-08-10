import type { FieldErrors, FieldValues } from 'react-hook-form';

/**
 * Retorna o caminho do primeiro erro de validação (ordem dos keys do objeto).
 * Não hardcoda campos — percorre `FieldErrors` do react-hook-form/Yup.
 */
export function getFirstFormErrorPath(
  errors: FieldErrors<FieldValues>,
): string | null {
  for (const [key, value] of Object.entries(errors)) {
    if (!value || key === 'root') continue;

    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        const item = value[index];
        if (!item) continue;
        if (
          typeof item === 'object' &&
          'message' in item &&
          (item as { message?: unknown }).message != null
        ) {
          return `${key}.${index}`;
        }
        if (typeof item === 'object') {
          const nested = getFirstFormErrorPath(
            item as FieldErrors<FieldValues>,
          );
          if (nested) return `${key}.${index}.${nested}`;
        }
      }
      continue;
    }

    if (
      typeof value === 'object' &&
      'message' in value &&
      (value as { message?: unknown }).message != null
    ) {
      return key;
    }

    if (typeof value === 'object') {
      const nested = getFirstFormErrorPath(value as FieldErrors<FieldValues>);
      if (nested) return `${key}.${nested}`;
    }
  }

  return null;
}

function resolveScrollTarget(path: string): HTMLElement | null {
  const escaped = CSS.escape(path);
  const named = document.querySelectorAll<HTMLElement>(`[name="${escaped}"]`);

  if (named.length > 0) {
    const first = named[0];
    let best: HTMLElement = first;
    let node: HTMLElement | null = first.parentElement;

    while (node && node.tagName !== 'FORM' && node !== document.body) {
      const matches = node.querySelectorAll(`[name="${escaped}"]`);
      if (matches.length >= named.length) {
        best = node;
        // Prefer a compact wrapper (label + control + helper), not the whole page.
        if (node.offsetHeight > 0 && node.offsetHeight < window.innerHeight) {
          best = node;
        }
      }
      if (node.offsetHeight >= window.innerHeight * 0.9) break;
      node = node.parentElement;
    }

    return best;
  }

  return (
    document.getElementById(path) ||
    document.querySelector<HTMLElement>(`[id="${escaped}"]`) ||
    document.querySelector<HTMLElement>(`[data-field="${escaped}"]`)
  );
}

type ScrollToFirstFormErrorOptions = {
  setFocus?: (name: string) => void;
};

/** Rola até o primeiro campo inválido; opcionalmente foca via RHF. */
export function scrollToFirstFormError(
  errors: FieldErrors<FieldValues>,
  options?: ScrollToFirstFormErrorOptions,
): void {
  const path = getFirstFormErrorPath(errors);
  if (!path) return;

  try {
    options?.setFocus?.(path);
  } catch {
    // Campos sem registro de focus (ex.: alguns radios) — segue só com scroll.
  }

  const target = resolveScrollTarget(path);
  if (!target) return;

  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const focusable =
      target.matches('input, select, textarea, button')
        ? target
        : target.querySelector<HTMLElement>('input, select, textarea, button');

    if (focusable && typeof focusable.focus === 'function') {
      try {
        focusable.focus({ preventScroll: true });
      } catch {
        // ignore
      }
    }
  });
}
