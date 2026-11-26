export type BulkRiskAddTask = {
  id: string;
  riskId: string;
  label: string;
  level: number | null;
  alreadyInInventory: boolean;
  sources: number;
  recommendations: number;
  hasAnalysis: boolean;
  sourcesToAdd?: number;
  recommendationsToAdd?: number;
  stepLabels?: string[];
  steps: Array<() => Promise<unknown>>;
};

export type BulkRiskAddExecution = { task: BulkRiskAddTask; nextStep: number; done: boolean; error?: string };

/** Keep the cursor after every successful request so retries do not repeat accepted steps. */
export async function runBulkRiskAdd(entries: BulkRiskAddExecution[], onProgress: (completed: number, total: number) => void) {
  let completed = 0;
  for (const entry of entries) {
    if (!entry.done) {
      entry.error = undefined;
      try {
        while (entry.nextStep < entry.task.steps.length) {
          await entry.task.steps[entry.nextStep]();
          entry.nextStep += 1;
        }
        entry.done = true;
      } catch (error) {
        const stage = entry.task.stepLabels?.[entry.nextStep] ?? 'Concluir risco/setor';
        const response = (error as { response?: { status?: number; data?: { message?: unknown } } })?.response;
        const message = response?.status === 400 && typeof response.data?.message === 'string'
          ? response.data.message.slice(0, 400) : 'Não foi possível concluir a solicitação. Tente novamente para continuar desta etapa.';
        entry.error = `${stage}: ${message}`;
      }
    }
    onProgress(++completed, entries.length);
  }
}
