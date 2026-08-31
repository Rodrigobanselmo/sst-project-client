/**
 * Matchers de ativo do Home agrupador (Gestão da Empresa).
 *
 * Não usa `/novo` como prefixo largo: cada filho contribui o próprio
 * href/activePrefix já existente (inclui Acervo Técnico em `/documentos`).
 */

export function isSidebarMatcherActive(
  path: string,
  matcher?: string,
): boolean {
  if (!matcher) return false;

  const current = path.split('?')[0];
  const candidate = matcher.split('?')[0];
  if (!current || !candidate) return false;

  return current === candidate || current.startsWith(candidate);
}

export function isSidebarAnyMatcherActive(
  path: string,
  matchers: Array<string | undefined>,
): boolean {
  return matchers.some((matcher) => isSidebarMatcherActive(path, matcher));
}

export function collectSidebarChildMatchers<
  T extends { href?: string; activePrefix?: string },
>(
  items: T[] | undefined,
  resolve: (item: T) => { href?: string; activePrefix?: string },
): Array<string | undefined> {
  if (!items?.length) return [];

  return items.map((item) => {
    const resolved = resolve(item);
    return resolved.activePrefix || resolved.href;
  });
}
