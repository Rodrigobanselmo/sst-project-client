// Deterministic hook lifecycle probe: no browser, microphone, network or provider calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const dir = path.resolve(
  'src/@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks',
);
function load(file, overrides = {}) {
  const filename = path.join(dir, file + '.ts');
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = module.paths;
  mod.require = (id) => overrides[id] ?? require(id);
  mod._compile(compiled, filename);
  return mod.exports;
}
const helper = load('collect-media-recorder-blob.util');
function mount(transcribe, getUserMedia) {
  const states = [],
    errors = [],
    texts = [],
    cleanups = [];
  let stateCalls = 0;
  const react = {
    useState: (initial) => {
      const slot = stateCalls++;
      return [
        initial,
        (value) => {
          if (slot === 0) states.push(value);
          if (slot === 1) errors.push(value);
        },
      ];
    },
    useRef: (value) => ({ current: value }),
    useCallback: (fn) => fn,
    useEffect: (fn) => {
      cleanups.push(fn());
    },
  };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { mediaDevices: { getUserMedia } },
  });
  const api = load('useCharacterizationAiAnalyzeAudioRecorder', {
    react,
    './collect-media-recorder-blob.util': helper,
    '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/transcribe-ai-analyze-characterization-audio.service':
      {},
  }).useCharacterizationAiAnalyzeAudioRecorder({
    companyId: 'synthetic',
    workspaceId: 'synthetic',
    transcribe,
    onTranscription: (text) => texts.push(text),
  });
  return {
    api,
    states,
    errors,
    texts,
    unmount: () => cleanups.forEach((fn) => fn?.()),
  };
}
const blob = (bytes) =>
  new Blob([new Uint8Array(bytes)], { type: 'audio/mp4' });
class Recorder {
  static latest;
  static isTypeSupported(type) {
    return type === 'audio/mp4';
  }
  constructor() {
    this.state = 'inactive';
    this.mimeType = 'audio/mp4';
    this.listeners = new Map();
    this.stopCalls = 0;
    Recorder.latest = this;
  }
  addEventListener(kind, fn) {
    if (!this.listeners.has(kind)) this.listeners.set(kind, new Set());
    this.listeners.get(kind).add(fn);
  }
  removeEventListener(kind, fn) {
    this.listeners.get(kind)?.delete(fn);
  }
  emit(kind, data) {
    const event = { data };
    this['on' + kind]?.(event);
    this.listeners.get(kind)?.forEach((fn) => fn(event));
  }
  start() {
    this.state = 'recording';
  }
  requestData() {}
  stop() {
    this.stopCalls++;
    this.state = 'inactive';
    queueMicrotask(() => {
      this.emit('dataavailable', blob(2048));
      this.emit('stop');
    });
  }
}
globalThis.MediaRecorder = Recorder;
(async () => {
  const seen = [];
  let trackStops = 0;
  const stream = { getTracks: () => [{ stop: () => trackStops++ }] };
  const mounted = mount(
    async (input) => {
      seen.push(input);
      return { text: 'Synthetic guidance' };
    },
    async () => stream,
  );
  await Promise.all([
    mounted.api.startRecording(),
    mounted.api.startRecording(),
  ]);
  const recorder = Recorder.latest;
  recorder.emit('dataavailable', blob(3072));
  await Promise.all([
    mounted.api.stopAndTranscribe(),
    mounted.api.stopAndTranscribe(),
  ]);
  assert.equal(
    recorder.stopCalls,
    1,
    'repeated stop must not interrupt capture',
  );
  assert.equal(seen.length, 1, 'only one transcription request');
  assert.equal(
    seen[0].audio.size,
    5120,
    'preserve periodic and final chunks exactly once',
  );
  assert.equal(seen[0].fileName, 'recording.mp4');
  assert.deepEqual(mounted.texts, ['Synthetic guidance']);
  assert(mounted.states.includes('stopping'));
  assert.equal(mounted.states.at(-1), 'idle');
  assert(trackStops > 0);
  mounted.unmount();

  let release;
  let lateTrackStops = 0;
  const pending = mount(
    async () => {
      throw Error('must not transcribe');
    },
    () => new Promise((resolve) => (release = resolve)),
  );
  const starting = pending.api.startRecording();
  pending.api.cancelRecording();
  release({ getTracks: () => [{ stop: () => lateTrackStops++ }] });
  await starting;
  assert.equal(
    lateTrackStops,
    1,
    'late microphone permission must release the stream after cancellation',
  );
  assert.equal(pending.states.at(-1), 'idle');
  pending.unmount();

  const failure = mount(
    async () => {
      throw Error('must not transcribe');
    },
    async () => stream,
  );
  await failure.api.startRecording();
  Recorder.latest.stop = () => {
    throw Error('encoder error');
  };
  await failure.api.stopAndTranscribe();
  assert(
    failure.errors.some((text) => text?.includes('finalizar')),
    'encoder failures must be visible',
  );
  assert.equal(failure.states.at(-1), 'idle');
  failure.unmount();
  let releaseTranscript, notifyStarted;
  const requestStarted = new Promise((resolve) => (notifyStarted = resolve));
  const cancelled = mount(
    () =>
      new Promise((resolve) => {
        releaseTranscript = resolve;
        notifyStarted();
      }),
    async () => stream,
  );
  await cancelled.api.startRecording();
  const stopping = cancelled.api.stopAndTranscribe();
  await requestStarted;
  cancelled.api.cancelRecording();
  await cancelled.api.startRecording();
  releaseTranscript({ text: 'Must not enter the next recording' });
  await stopping;
  assert.deepEqual(
    cancelled.texts,
    [],
    'cancelled transcription must not overwrite a later session',
  );
  assert.equal(
    cancelled.states.at(-1),
    'recording',
    'old session must not stop a new one',
  );
  cancelled.api.cancelRecording();
  cancelled.unmount();

  console.log('Audio guidance lifecycle checks passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
