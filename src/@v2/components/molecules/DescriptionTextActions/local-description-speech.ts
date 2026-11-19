import {
  DEFAULT_SPEECH_SETTINGS,
  normalizeSpeechSettings,
  type SpeechSettings,
} from './speech-settings';

/** Local synthesis only. No provider, network client or remote-voice fallback. */
export function selectLocalPortugueseVoice(
  voices: SpeechSynthesisVoice[],
  preferredVoiceURI?: string | null,
) {
  const local = voices.filter(
    (voice) => voice.localService && /^pt(?:[-_]|$)/i.test(voice.lang),
  );
  if (preferredVoiceURI)
    return local.find((voice) => voice.voiceURI === preferredVoiceURI);
  return local.find((voice) => /^pt[-_]BR$/i.test(voice.lang)) || local[0];
}

export function splitSpeechText(text: string): string[] {
  const chunks: string[] = [];
  let rest = text.trim();
  while (rest) {
    let end = Math.min(300, rest.length);
    if (end < rest.length) {
      const boundary = rest.slice(0, end).search(/[.!?;\n][^.!?;\n]*$/);
      const space = rest.lastIndexOf(' ', end);
      if (boundary > 100) end = boundary + 1;
      else if (space > 0) end = space;
    }
    chunks.push(rest.slice(0, end));
    rest = rest.slice(end).trimStart();
  }
  return chunks;
}

type Callbacks = { onStop: () => void; onError: () => void };

export function createLocalSpeechController(
  synth: SpeechSynthesis,
  utterance: () => SpeechSynthesisUtterance,
) {
  let session:
    | {
        owner: symbol;
        callbacks: Callbacks;
        current?: SpeechSynthesisUtterance;
      }
    | undefined;
  const stop = (owner?: symbol) => {
    if (!session || (owner && session.owner !== owner)) return;
    const previous = session;
    session = undefined;
    synth.cancel();
    previous.callbacks.onStop();
  };
  return {
    stop,
    speak(
      owner: symbol,
      text: string,
      voice: SpeechSynthesisVoice,
      callbacks: Callbacks,
      settings: SpeechSettings = DEFAULT_SPEECH_SETTINGS,
    ) {
      if (!voice.localService || !/^pt(?:[-_]|$)/i.test(voice.lang))
        throw new Error('Local Portuguese voice required');
      stop();
      const options = normalizeSpeechSettings(settings);
      const chunks = splitSpeechText(text);
      if (!chunks.length) return;
      const current = {
        owner,
        callbacks,
        current: undefined as SpeechSynthesisUtterance | undefined,
      };
      session = current;
      const next = (index: number) => {
        if (session !== current) return;
        if (index >= chunks.length) {
          session = undefined;
          callbacks.onStop();
          return;
        }
        try {
          const item = utterance();
          current.current = item; // Keep alive until the platform finishes the utterance.
          item.text = chunks[index];
          item.voice = voice;
          item.lang = voice.lang;
          item.rate = options.rate;
          item.pitch = options.pitch;
          item.volume = options.volume;
          item.onend = () => {
            if (session === current) next(index + 1);
          };
          item.onerror = () => {
            if (session !== current) return;
            stop(owner);
            callbacks.onError();
          };
          synth.speak(item);
        } catch {
          if (session !== current) return;
          stop(owner);
          callbacks.onError();
        }
      };
      next(0);
    },
  };
}

let controller: ReturnType<typeof createLocalSpeechController> | undefined;
export function getLocalSpeechController() {
  if (
    typeof window === 'undefined' ||
    !window.speechSynthesis ||
    !window.SpeechSynthesisUtterance
  )
    return;
  controller ??= createLocalSpeechController(
    window.speechSynthesis,
    () => new window.SpeechSynthesisUtterance(),
  );
  return controller;
}
