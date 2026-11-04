/** The hidden workspace cards must not compete with operational screen requests. */
export function shouldLoadSummaryMetrics(stage: unknown, collapsed: boolean, hydrated: boolean): boolean {
  const primaryStage = ['empresa', 'empregados', 'sst', 'documentos'].includes(String(stage));
  return !primaryStage || (hydrated && !collapsed);
}
