/**
 * Limpeza de HTML para apresentação (UI / futuro PDF).
 * Não altera conteúdo persistido — apenas o texto exibido.
 * Não usa DOM, dangerouslySetInnerHTML nem JSON.stringify.
 */

const HTML_TAG_RE = /<\/?[^>]+>/g;
const BR_TAG_RE = /<br\s*\/?\s*>/gi;
const MULTI_SPACE_RE = /\s+/g;

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
};

/**
 * Remove tags HTML, decodifica entidades comuns e colapsa espaços.
 * Retorna string vazia quando não resta texto útil.
 */
export function stripHtmlForDisplay(value: string): string {
  if (!value) return '';

  let text = value;

  // Quebras explícitas viram espaço antes de remover tags.
  text = text.replace(BR_TAG_RE, ' ');

  // Remove qualquer tag restante (<p>, <strong>, <em>, aninhadas, etc.).
  text = text.replace(HTML_TAG_RE, '');

  // Entidades nomeadas comuns.
  text = text.replace(
    /&(#x?[0-9a-f]+|[a-z]+);/gi,
    (match, entity: string) => {
      const key = entity.toLowerCase();
      if (key in NAMED_ENTITIES) return NAMED_ENTITIES[key];
      if (key.startsWith('#x')) {
        const code = Number.parseInt(key.slice(2), 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      if (key.startsWith('#')) {
        const code = Number.parseInt(key.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      return match;
    },
  );

  return text.replace(MULTI_SPACE_RE, ' ').trim();
}
