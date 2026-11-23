/** Same floor as the Whisper use case. Do not change as a MediaRecorder workaround. */
export const MIN_AI_ANALYZE_AUDIO_BYTES = 1024;

export type MediaRecorderLike = {
  state: string;
  mimeType?: string;
  requestData?: () => void;
  stop: () => void;
  addEventListener: (
    type: string,
    listener: (event: { data?: Blob }) => void,
  ) => void;
  removeEventListener: (
    type: string,
    listener: (event: { data?: Blob }) => void,
  ) => void;
};

export function canFinalizeRecorderBlob(params: {
  stopEventFired: boolean;
  receivedDataAfterStop: boolean;
}): boolean {
  return params.stopEventFired && params.receivedDataAfterStop;
}

export function isRecorderBlobTooShort(
  blob: Blob,
  minBytes = MIN_AI_ANALYZE_AUDIO_BYTES,
): boolean {
  return blob.size < minBytes;
}

export function buildRecorderBlob(chunks: Blob[], mimeType: string): Blob {
  return new Blob(chunks, { type: mimeType });
}

/** Collects the final encoder flush with a bounded wait, including out-of-order events. */
export function stopAndCollectMediaRecorderBlob(params: {
  mediaRecorder: MediaRecorderLike;
  chunks: Blob[];
  mimeType: string;
  flushTimeoutMs?: number;
  extraFlushMs?: number;
  stopTimeoutMs?: number;
  /** The hook records every chunk from start; do not append the same event twice. */
  dataAlreadyCollected?: boolean;
}): Promise<Blob> {
  const {
    mediaRecorder,
    chunks,
    mimeType,
    flushTimeoutMs = 1500,
    extraFlushMs = 300,
    stopTimeoutMs = 10000,
    dataAlreadyCollected = false,
  } = params;
  if (mediaRecorder.state === 'inactive')
    return Promise.resolve(buildRecorderBlob(chunks, mimeType));

  return new Promise((resolve, reject) => {
    let settled = false;
    let stopped = false;
    let flushTimer: ReturnType<typeof setTimeout> | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => {
      mediaRecorder.removeEventListener('dataavailable', onData);
      mediaRecorder.removeEventListener('stop', onStop);
      mediaRecorder.removeEventListener('error', onError);
      clearTimeout(flushTimer);
      clearTimeout(watchdog);
    };
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else
        resolve(buildRecorderBlob(chunks, mediaRecorder.mimeType || mimeType));
    };
    const onData = (event: { data?: Blob }) => {
      if (!event.data?.size) return;
      if (!dataAlreadyCollected) chunks.push(event.data);
      if (stopped) {
        clearTimeout(flushTimer);
        flushTimer = setTimeout(() => finish(), extraFlushMs);
      }
    };
    const onStop = () => {
      stopped = true;
      // Do not finalize early just because requestData emitted a container header.
      clearTimeout(flushTimer);
      flushTimer = setTimeout(() => finish(), flushTimeoutMs);
    };
    const onError = () =>
      finish(new Error('O navegador interrompeu a gravação. Tente novamente.'));
    mediaRecorder.addEventListener('dataavailable', onData);
    mediaRecorder.addEventListener('stop', onStop);
    mediaRecorder.addEventListener('error', onError);
    watchdog = setTimeout(
      () =>
        finish(
          new Error('O navegador não concluiu a gravação. Tente novamente.'),
        ),
      stopTimeoutMs,
    );
    try {
      mediaRecorder.requestData?.();
    } catch {
      /* stop still flushes */
    }
    try {
      mediaRecorder.stop();
    } catch {
      finish(
        new Error('Não foi possível finalizar a gravação. Tente novamente.'),
      );
    }
  });
}

export function withAudioTranscriptionTimeout<T>(
  operation: Promise<T>,
  timeoutMs = 120000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          new Error(
            'A transcrição demorou mais que o esperado. Tente novamente.',
          ),
        ),
      timeoutMs,
    );
    operation.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
