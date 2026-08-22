export type VariableCatalogEntry = {
  type: string;
  label: string;
  value?: string;
};

export type VariablePresentation = {
  type: string;
  label: string;
  unknown: boolean;
  token: string;
};

export type VariableLineToken =
  | { kind: 'text'; text: string; start: number; end: number }
  | {
      kind: 'variable';
      type: string;
      token: string;
      start: number;
      end: number;
    };

/** Canonical persistido: `??TIPO_DA_VARIAVEL??`. */
export const VARIABLE_CANONICAL_RE = /\?\?([A-Za-z0-9_]+)\?\?/g;

export function serializeVariableToken(type: string): string {
  return `??${type}??`;
}

export function parseVariableToken(token: string): string | null {
  const match = /^\?\?([A-Za-z0-9_]+)\?\?$/.exec(token);
  return match ? match[1] : null;
}

export function lookupVariableCatalog(
  type: string,
  catalog?: VariableCatalogEntry[] | null,
): VariableCatalogEntry | undefined {
  return (catalog || []).find((item) => item.type === type);
}

export function resolveVariablePresentation(
  type: string,
  catalog?: VariableCatalogEntry[] | null,
): VariablePresentation {
  const entry = lookupVariableCatalog(type, catalog);
  return {
    type,
    token: serializeVariableToken(type),
    label: entry?.label || type,
    unknown: !entry,
  };
}

/**
 * Espelha o split V1 em `??`, mas só materializa tokens fechados
 * `??TIPO??` para o roundtrip permanecer lossless.
 */
export function tokenizeVariableLine(text: string): VariableLineToken[] {
  if (!text) return [];

  const tokens: VariableLineToken[] = [];
  const matcher = new RegExp(VARIABLE_CANONICAL_RE.source, 'g');
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(text))) {
    if (match.index > cursor) {
      tokens.push({
        kind: 'text',
        text: text.slice(cursor, match.index),
        start: cursor,
        end: match.index,
      });
    }
    tokens.push({
      kind: 'variable',
      type: match[1],
      token: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    tokens.push({
      kind: 'text',
      text: text.slice(cursor),
      start: cursor,
      end: text.length,
    });
  }

  return tokens;
}
