export function formatRiskSubTypeButtonLabel(name: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return '';

  const tags = [...trimmed.matchAll(/\[([^\]]+)\]/g)].map((match) => match[0]);
  if (tags.length) {
    return tags[tags.length - 1];
  }

  return trimmed;
}

export function resolveLinkedRiskSubTypeId(
  risk?: {
    subTypes?: { sub_type?: { id?: string | number | null } | null }[];
    subType?: string | number | null;
  } | null,
): string | undefined {
  const fromLink = risk?.subTypes?.[0]?.sub_type?.id;
  if (fromLink != null && fromLink !== '') {
    return String(fromLink);
  }

  if (risk?.subType != null && risk.subType !== '') {
    return String(risk.subType);
  }

  return undefined;
}
