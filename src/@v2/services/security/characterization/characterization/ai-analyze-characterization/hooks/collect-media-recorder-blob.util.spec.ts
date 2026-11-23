/**
 * Testes pontuais da coleta determinística do MediaRecorder.
 * Executar:
 * npx tsx src/@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/collect-media-recorder-blob.util.spec.ts
 */
import {
  MIN_AI_ANALYZE_AUDIO_BYTES,
  buildRecorderBlob,
  canFinalizeRecorderBlob,
  isRecorderBlobTooShort,
  stopAndCollectMediaRecorderBlob,
  withAudioTranscriptionTimeout,
  type MediaRecorderLike,
} from './collect-media-recorder-blob.util';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

type Listener = (event: { data?: Blob }) => void;

function createFakeRecorder(params: {
  order?: 'stop-first' | 'data-first';
  chunk?: Blob;
  requestDataChunk?: Blob;
  afterStopEvents?: Blob[];
}): MediaRecorderLike & { requestDataCalls: number } {
  const listeners = new Map<string, Listener[]>();
  const emit = (type: string, event: { data?: Blob }) => {
    (listeners.get(type) || []).forEach((listener) => listener(event));
  };
  const recorder: MediaRecorderLike & { requestDataCalls: number } = {
    state: 'recording',
    mimeType: 'audio/webm',
    requestDataCalls: 0,
    requestData() {
      recorder.requestDataCalls += 1;
      if (params.requestDataChunk) {
        emit('dataavailable', { data: params.requestDataChunk });
      }
    },
    addEventListener(type, listener) {
      const current = listeners.get(type) || [];
      current.push(listener);
      listeners.set(type, current);
    },
    removeEventListener(type, listener) {
      const current = listeners.get(type) || [];
      listeners.set(
        type,
        current.filter((item) => item !== listener),
      );
    },
    stop() {
      recorder.state = 'inactive';
      if (params.afterStopEvents) {
        emit('stop', {});
        params.afterStopEvents.forEach((data) => {
          queueMicrotask(() => emit('dataavailable', { data }));
        });
        return;
      }
      const dataEvent = { data: params.chunk };
      if (params.order === 'data-first') {
        emit('dataavailable', dataEvent);
        emit('stop', {});
        return;
      }
      emit('stop', {});
      queueMicrotask(() => emit('dataavailable', dataEvent));
    },
  };
  return recorder;
}

assert(
  canFinalizeRecorderBlob({
    stopEventFired: true,
    receivedDataAfterStop: true,
  }) === true,
  'só finaliza com stop + dataavailable após stop',
);
assert(
  canFinalizeRecorderBlob({
    stopEventFired: true,
    receivedDataAfterStop: false,
  }) === false,
  'não monta blob só no stop',
);
assert(
  canFinalizeRecorderBlob({
    stopEventFired: false,
    receivedDataAfterStop: true,
  }) === false,
  'não monta blob só no dataavailable',
);

const shortBlob = buildRecorderBlob([], 'audio/webm');
assert(
  isRecorderBlobTooShort(shortBlob) === true,
  'blob vazio continua abaixo do piso de 1 KB',
);
assert(MIN_AI_ANALYZE_AUDIO_BYTES === 1024, 'piso de 1 KB permanece');

const validChunk = new Blob([new Uint8Array(2048)], { type: 'audio/webm' });
assert(
  isRecorderBlobTooShort(buildRecorderBlob([validChunk], 'audio/webm')) ===
    false,
  'gravação válida permanece acima de 1 KB',
);

const emptyChunk = new Blob([], { type: 'audio/webm' });

async function runAsyncCases() {
  const recorderStopFirst = createFakeRecorder({
    order: 'stop-first',
    chunk: validChunk,
  });
  const blobStopFirst = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: recorderStopFirst,
    chunks: [],
    mimeType: 'audio/webm',
  });
  assert(
    recorderStopFirst.requestDataCalls === 1,
    'requestData deve ser chamado antes do stop',
  );
  assert(
    blobStopFirst.size >= MIN_AI_ANALYZE_AUDIO_BYTES,
    'corrida stop-primeiro ainda coleta o flush',
  );

  const recorderDataFirst = createFakeRecorder({
    order: 'data-first',
    chunk: validChunk,
  });
  const blobDataFirst = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: recorderDataFirst,
    chunks: [],
    mimeType: 'audio/webm',
  });
  assert(
    blobDataFirst.size >= MIN_AI_ANALYZE_AUDIO_BYTES,
    'ordem dataavailable-depois-stop continua válida',
  );

  const recorderShort = createFakeRecorder({
    order: 'stop-first',
    chunk: emptyChunk,
  });
  const blobShort = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: recorderShort,
    chunks: [],
    mimeType: 'audio/webm',
    flushTimeoutMs: 20,
  });
  assert(
    isRecorderBlobTooShort(blobShort) === true,
    'gravação realmente curta/vazia continua recusada pelo piso de 1 KB',
  );

  const prefixChunk = new Blob([new Uint8Array(512)], { type: 'audio/webm' });
  const recorderMerged = createFakeRecorder({
    order: 'stop-first',
    chunk: validChunk,
    requestDataChunk: prefixChunk,
  });
  const blobMerged = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: recorderMerged,
    chunks: [],
    mimeType: 'audio/webm',
  });
  assert(
    blobMerged.size === prefixChunk.size + validChunk.size,
    'requestData antes do stop não descarta o flush final',
  );

  const recorderEmptyThenValid = createFakeRecorder({
    afterStopEvents: [emptyChunk, validChunk],
  });
  const blobEmptyThenValid = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: recorderEmptyThenValid,
    chunks: [],
    mimeType: 'audio/webm',
    flushTimeoutMs: 200,
  });
  assert(
    blobEmptyThenValid.size === validChunk.size,
    'stop → dataavailable(0) → dataavailable(>0) aguarda o chunk válido',
  );
  assert(
    isRecorderBlobTooShort(blobEmptyThenValid) === false,
    'primeira gravação com evento vazio intermediário não é recusada como curta',
  );

  const recorderEmptyOnly = createFakeRecorder({
    afterStopEvents: [emptyChunk],
  });
  const blobEmptyOnly = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: recorderEmptyOnly,
    chunks: [],
    mimeType: 'audio/webm',
    flushTimeoutMs: 20,
  });
  assert(
    blobEmptyOnly.size === 0,
    'dataavailable(size=0) apenas + timeout retorna blob vazio',
  );
  assert(
    isRecorderBlobTooShort(blobEmptyOnly) === true,
    'blob vazio após timeout continua abaixo do piso de 1 KB',
  );

  const recorderValidThenEmpty = createFakeRecorder({
    requestDataChunk: validChunk,
    afterStopEvents: [emptyChunk],
  });
  const blobValidThenEmpty = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: recorderValidThenEmpty,
    chunks: [],
    mimeType: 'audio/webm',
    extraFlushMs: 20,
    flushTimeoutMs: 200,
  });
  assert(
    blobValidThenEmpty.size === validChunk.size,
    'chunk válido antes do stop + vazio depois preserva o chunk válido',
  );
  // A tiny container header must not cause the real encoded speech to be discarded.
  const listeners = new Map<string, Set<Listener>>();
  const emit = (kind: string, data?: Blob) =>
    listeners.get(kind)?.forEach((fn) => fn({ data }));
  const delayedRecorder: MediaRecorderLike = {
    state: 'recording',
    mimeType: 'audio/mp4',
    addEventListener: (kind, fn) => {
      if (!listeners.has(kind)) listeners.set(kind, new Set());
      listeners.get(kind)!.add(fn);
    },
    removeEventListener: (kind, fn) => {
      listeners.get(kind)?.delete(fn);
    },
    requestData: () => emit('dataavailable', prefixChunk),
    stop: () => {
      delayedRecorder.state = 'inactive';
      emit('stop');
      setTimeout(() => emit('dataavailable', validChunk), 80);
    },
  };
  const delayedBlob = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: delayedRecorder,
    chunks: [],
    mimeType: 'audio/mp4',
    flushTimeoutMs: 150,
    extraFlushMs: 10,
  });
  assert(
    delayedBlob.size === prefixChunk.size + validChunk.size,
    'header before stop must not hide a delayed audio chunk',
  );
  assert(
    delayedBlob.type === 'audio/mp4',
    'actual recorder format preserved for Safari',
  );
  assert(
    [...listeners.values()].every((set) => set.size === 0),
    'listeners cleaned after completion',
  );

  const alreadyCollected = [validChunk];
  const inactive = createFakeRecorder({});
  inactive.state = 'inactive';
  const preserved = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: inactive,
    chunks: alreadyCollected,
    mimeType: 'audio/mp4',
    dataAlreadyCollected: true,
  });
  assert(
    preserved.size === validChunk.size,
    'spontaneous stop keeps chunks collected during recording',
  );

  const collectedByHook = [prefixChunk];
  const hooked = createFakeRecorder({ chunk: validChunk, order: 'data-first' });
  const originalStop = hooked.stop;
  hooked.stop = () => {
    collectedByHook.push(validChunk);
    originalStop();
  };
  const once = await stopAndCollectMediaRecorderBlob({
    mediaRecorder: hooked,
    chunks: collectedByHook,
    mimeType: 'audio/webm',
    dataAlreadyCollected: true,
    flushTimeoutMs: 10,
  });
  assert(
    once.size === prefixChunk.size + validChunk.size,
    'hook collector must not duplicate the final audio event',
  );

  const missingStop = createFakeRecorder({});
  missingStop.stop = () => {};
  let timedOut = false;
  try {
    await stopAndCollectMediaRecorderBlob({
      mediaRecorder: missingStop,
      chunks: [],
      mimeType: 'audio/webm',
      stopTimeoutMs: 10,
    });
  } catch {
    timedOut = true;
  }
  assert(timedOut, 'missing stop event must reject rather than wait forever');
  const failedStop = createFakeRecorder({});
  failedStop.stop = () => {
    throw new Error('encoder failed');
  };
  let failed = false;
  try {
    await stopAndCollectMediaRecorderBlob({
      mediaRecorder: failedStop,
      chunks: [],
      mimeType: 'audio/webm',
    });
  } catch {
    failed = true;
  }
  assert(failed, 'stop failure must reach the UI error handler');
  let transcriptionTimeout = false;
  try {
    await withAudioTranscriptionTimeout(new Promise(() => {}), 10);
  } catch {
    transcriptionTimeout = true;
  }
  assert(
    transcriptionTimeout,
    'unresponsive transcription must return an actionable error',
  );
  assert(
    (await withAudioTranscriptionTimeout(
      Promise.resolve('Synthetic text'),
      10,
    )) === 'Synthetic text',
    'successful transcription preserved',
  );
}

void runAsyncCases()
  .then(() => {
    console.log('collect-media-recorder-blob.util.spec.ts OK');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
