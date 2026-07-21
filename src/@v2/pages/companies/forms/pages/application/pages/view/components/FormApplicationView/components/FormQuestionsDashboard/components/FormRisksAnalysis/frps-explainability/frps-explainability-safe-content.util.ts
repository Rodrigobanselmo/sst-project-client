/**
 * Normalizador central recursivo para conteúdo exibível da explicabilidade FRPS.
 * Nunca retorna objetos brutos para React children.
 */

import { stripHtmlForDisplay } from './strip-html-for-display.util';

const TEXTUAL_OBJECT_KEYS = [
  'text',
  'question',
  'label',
  'name',
  'description',
  'value',
  'title',
  'nome',
] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function finalizeDisplayString(value: string): string | null {
  const cleaned = stripHtmlForDisplay(value);
  return cleaned.length > 0 ? cleaned : null;
}

function extractTextFromObject(value: Record<string, unknown>): string | null {
  for (const key of TEXTUAL_OBJECT_KEYS) {
    const nested = value[key];
    if (typeof nested === 'string') {
      const cleaned = finalizeDisplayString(nested);
      if (cleaned) return cleaned;
      continue;
    }
    if (typeof nested === 'number' || typeof nested === 'boolean') {
      return String(nested);
    }
  }
  return null;
}

/**
 * Converte valor arbitrário em texto seguro para UI.
 * Objetos técnicos desconhecidos → null (não renderiza).
 */
export function normalizeDisplayText(
  value: unknown,
  options?: { allowBooleanNumber?: boolean },
): string | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    return finalizeDisplayString(value);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return options?.allowBooleanNumber === false ? null : String(value);
  }

  if (typeof value === 'boolean') {
    return options?.allowBooleanNumber === false ? null : String(value);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => normalizeDisplayText(item, options))
      .filter((item): item is string => Boolean(item));
    if (!parts.length) return null;
    return parts.join('\n');
  }

  if (isPlainObject(value)) {
    return extractTextFromObject(value);
  }

  return null;
}

function comparisonKeyForDisplayList(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR');
}

/**
 * Deduplica lista de apresentação (primeira ocorrência).
 * Compara sem HTML (já removido), trim, espaços colapsados e case-insensitive.
 */
export function dedupeDisplayList(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = comparisonKeyForDisplayList(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

/**
 * Converte valor arbitrário em lista de textos seguros.
 * Remove HTML, ignora vazios e deduplica por texto normalizado.
 */
export function normalizeDisplayList(value: unknown): string[] {
  if (value == null) return [];

  if (typeof value === 'string') {
    const cleaned = finalizeDisplayString(value);
    return cleaned ? [cleaned] : [];
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return [String(value)];
  }

  if (typeof value === 'boolean') {
    return [String(value)];
  }

  if (!Array.isArray(value)) {
    if (isPlainObject(value)) {
      const text = extractTextFromObject(value);
      return text ? [text] : [];
    }
    return [];
  }

  const items: string[] = [];
  for (const entry of value) {
    if (entry == null) continue;
    if (typeof entry === 'string') {
      const cleaned = finalizeDisplayString(entry);
      if (cleaned) items.push(cleaned);
      continue;
    }
    if (typeof entry === 'number' && Number.isFinite(entry)) {
      items.push(String(entry));
      continue;
    }
    if (typeof entry === 'boolean') {
      items.push(String(entry));
      continue;
    }
    if (isPlainObject(entry)) {
      const text = extractTextFromObject(entry);
      if (text) items.push(text);
    }
    // objeto desconhecido / função / etc. → ignorar
  }
  return dedupeDisplayList(items);
}

export function normalizeIsoDateLabel(value: unknown): string | null {
  if (value == null) return null;
  const raw =
    value instanceof Date
      ? value.toISOString()
      : typeof value === 'string' || typeof value === 'number'
        ? value
        : null;
  if (raw == null) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Nome amigável de pessoa a partir de string ou objeto { name } / { nome }. */
export function normalizePersonLabel(value: unknown): string | null {
  if (typeof value === 'string') {
    return finalizeDisplayString(value);
  }
  if (!isPlainObject(value)) return null;
  return (
    normalizeDisplayText(value.name) ||
    normalizeDisplayText(value.nome) ||
    normalizeDisplayText(value.label) ||
    null
  );
}

export { stripHtmlForDisplay } from './strip-html-for-display.util';

export function isPlainContentObject(
  value: unknown,
): value is Record<string, unknown> {
  return isPlainObject(value);
}

/** Valida shape mínimo de resposta available=true (GET/POST). */
export function isCompatibleFrpsAvailablePayload(value: unknown): boolean {
  if (!isPlainObject(value)) return false;
  if (value.available !== true) return false;
  if (!isPlainObject(value.conceptual)) return false;
  if (!isPlainObject(value.conceptual.content)) return false;
  if (typeof value.conceptual.id !== 'string') return false;
  if (typeof value.conceptual.itemKey !== 'string') return false;
  if (typeof value.conceptual.validationStatus !== 'string') return false;
  if (!isPlainObject(value.contextual)) return false;
  if (typeof value.contextual.protectedData !== 'boolean') return false;
  if (
    value.contextual.protectedData === false &&
    !isPlainObject(value.contextual.content)
  ) {
    return false;
  }
  return true;
}

/** @deprecated use normalizeDisplayText */
export const toSafeDisplayText = normalizeDisplayText;
/** @deprecated use normalizeDisplayList */
export const toSafeDisplayList = normalizeDisplayList;
/** @deprecated use normalizeIsoDateLabel */
export const toSafeIsoDateLabel = normalizeIsoDateLabel;
/** @deprecated */
export const isFrpsAvailableExplanationPayload = isCompatibleFrpsAvailablePayload;
