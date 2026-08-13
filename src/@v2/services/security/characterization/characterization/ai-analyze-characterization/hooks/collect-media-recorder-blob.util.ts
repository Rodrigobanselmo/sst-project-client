/** Same floor as the Whisper use case. Do not change as a MediaRecorder workaround. */
export const MIN_AI_ANALYZE_AUDIO_BYTES = 1024;

export type MediaRecorderLike = {
  state: string;
  mimeType?: string;
  requestData?: () => void;
  stop: () => void;
  addEventListener: (type: string, listener: (event: { data?: Blob }) => void) => void;
  removeEventListener: (type: string, listener: (event: { data?: Blob }) => void) => void;
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

/**
 * Stops the recorder and waits until BOTH:
 * - the `stop` event fired (recorder actually inactive);
 * - a non-empty `dataavailable` after that stop, or a timeout if the encoder
 *   never emits a valid chunk (Safari can omit a flush).
 *
 * Empty `dataavailable` events (size === 0) are ignored and must not settle
 * the Promise: Chrome can fire an empty flush from `requestData()` after
 * `stop` and before the real chunk (first take).
 */
export function stopAndCollectMediaRecorderBlob(params: {
  mediaRecorder: MediaRecorderLike;
  chunks: Blob[];
  mimeType: string;
  flushTimeoutMs?: number;
  extraFlushMs?: number;
}): Promise<Blob> {
  const {
    mediaRecorder,
    chunks,
    mimeType,
    flushTimeoutMs = 500,
    extraFlushMs = 50,
  } = params;

  if (mediaRecorder.state === 'inactive') {
    return Promise.resolve(buildRecorderBlob(chunks, mimeType));
  }

  return new Promise((resolve) => {
    let settled = false;
    let stopEventFired = false;
    let receivedDataAfterStop = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      mediaRecorder.removeEventListener('dataavailable', onDataAvailable);
      mediaRecorder.removeEventListener('stop', onStop);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const settle = () => {
      if (settled) return;
      if (!canFinalizeRecorderBlob({ stopEventFired, receivedDataAfterStop })) {
        return;
      }
      settled = true;
      cleanup();
      resolve(buildRecorderBlob(chunks, mimeType));
    };

    const onDataAvailable = (event: { data?: Blob }) => {
      if (!(event.data && event.data.size > 0)) {
        return;
      }
      chunks.push(event.data);
      if (stopEventFired) {
        receivedDataAfterStop = true;
        settle();
      }
    };

    const onStop = () => {
      stopEventFired = true;
      timeoutId = setTimeout(
        () => {
          receivedDataAfterStop = true;
          settle();
        },
        chunks.length > 0 ? extraFlushMs : flushTimeoutMs,
      );
    };

    mediaRecorder.addEventListener('dataavailable', onDataAvailable);
    mediaRecorder.addEventListener('stop', onStop);

    try {
      mediaRecorder.requestData?.();
    } catch {
      // Safari/Chrome may throw if the encoder is not ready; stop() still flushes.
    }
    mediaRecorder.stop();
  });
}
