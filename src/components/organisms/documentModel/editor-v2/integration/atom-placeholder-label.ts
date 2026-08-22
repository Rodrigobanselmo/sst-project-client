import { atomVisualLabel } from '../domain/atom-visual';

export function formatAtomPlaceholder(
  type: string | undefined,
  source?: { orientation?: string } | null,
  catalogLabel?: string,
): string {
  return atomVisualLabel(type, source, catalogLabel);
}
