/**
 * Quando o pai está ativo só por um filho (`forceActive`), o href
 * precisa continuar sendo o destino do pai — não o asPath atual.
 */
export function resolveSidebarActiveLinkHref({
  href,
  asPath,
  isActive,
  forceActive,
}: {
  href: string;
  asPath: string;
  isActive: boolean;
  forceActive?: boolean;
}): string {
  if (forceActive) return href;
  return isActive ? asPath : href;
}
