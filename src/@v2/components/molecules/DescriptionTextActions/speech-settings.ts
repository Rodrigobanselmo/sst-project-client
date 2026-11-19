export type SpeechSettings = {
  voiceURI: string | null;
  rate: number;
  pitch: number;
  volume: number;
};
export const DEFAULT_SPEECH_SETTINGS: SpeechSettings = Object.freeze({
  voiceURI: null,
  rate: 1,
  pitch: 1,
  volume: 1,
});

export function normalizeSpeechSettings(value: unknown): SpeechSettings {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const number = (
    key: 'rate' | 'pitch' | 'volume',
    min: number,
    max: number,
  ) => {
    const candidate = source[key];
    return typeof candidate === 'number' &&
      Number.isFinite(candidate) &&
      candidate >= min &&
      candidate <= max
      ? candidate
      : DEFAULT_SPEECH_SETTINGS[key];
  };
  return {
    voiceURI:
      typeof source.voiceURI === 'string' &&
      source.voiceURI.trim() &&
      source.voiceURI.length <= 512
        ? source.voiceURI
        : null,
    rate: number('rate', 0.5, 2),
    pitch: number('pitch', 0, 2),
    volume: number('volume', 0, 1),
  };
}
