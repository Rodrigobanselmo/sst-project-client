let exportBusy = false;

export function isPresentationExportBusy() {
  return exportBusy;
}

export async function runPresentationExport<T>(task: () => Promise<T>): Promise<T> {
  if (exportBusy) {
    throw new Error('Já existe uma exportação em andamento.');
  }

  exportBusy = true;

  try {
    return await task();
  } finally {
    exportBusy = false;
  }
}
