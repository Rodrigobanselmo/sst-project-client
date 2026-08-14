/** Query do Fuse: sem `transformSearch`, o texto digitado segue intacto. */
export function resolveFuseSearchQuery(
  search: string,
  transformSearch?: (value: string) => string,
): string {
  return transformSearch ? transformSearch(search) : search;
}
