/**
 * Elegibilidade do Resumo para o Inventário de Riscos.
 * Fonte = Descrição ∨ Processos ∨ Considerações. O resumo é derivado, nunca fonte.
 */
export const INVENTORY_SUMMARY_DISABLED_TOOLTIP =
  'O resumo do inventário depende do conteúdo existente em Descrição, Processos ou Considerações.';

export function canGenerateInventorySummary(flags: {
  hasDescription?: boolean;
  hasProcesses?: boolean;
  hasConsiderations?: boolean;
}): boolean {
  return !!(
    flags.hasDescription ||
    flags.hasProcesses ||
    flags.hasConsiderations
  );
}

/** Texto limpo de item `texto{type}=PARAGRAPH`. */
export function stripCharacterizationArrayItem(raw: string): string {
  return String(raw || '')
    .split('{type}=')[0]
    .trim();
}

export function hasCharacterizationArrayContent(
  items: string[] | undefined | null,
): boolean {
  return (items || []).some((item) => stripCharacterizationArrayItem(item).length > 0);
}

export function previewCharacterizationArray(
  items: string[] | undefined | null,
  max = 120,
): string {
  const first = (items || [])
    .map(stripCharacterizationArrayItem)
    .find((text) => text.length > 0);
  if (!first) return '';
  return first.length > max ? `${first.slice(0, max)}…` : first;
}

/** Texto completo para o cockpit (todos os itens, legível). */
export function formatCharacterizationArrayContent(
  items: string[] | undefined | null,
): string {
  return (items || [])
    .map(stripCharacterizationArrayItem)
    .filter((text) => text.length > 0)
    .join('\n\n');
}

export function previewPlainText(
  value: string | undefined | null,
  max = 120,
): string {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function formatPlainContent(
  value: string | undefined | null,
): string {
  return String(value || '').trim();
}

/** Linhas visíveis no cartão do cockpit quando recolhido (~5–8). */
export const COCKPIT_FIELD_COLLAPSED_LINES = 7;

export type CharacterizationTechnicalContentPrefer =
  | 'assist'
  | 'summary';

export type CharacterizationInitialAiAction =
  | 'assist'
  | 'inventory-summary';
