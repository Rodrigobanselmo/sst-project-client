import { useSyncExternalStore } from 'react';
import {
  DEFAULT_SPEECH_SETTINGS,
  normalizeSpeechSettings,
  type SpeechSettings,
} from './speech-settings';

export const SPEECH_SETTINGS_STORAGE_KEY = 'simplesst.description-speech.v1';
let current = DEFAULT_SPEECH_SETTINGS;
let initialized = false;
let sessionOnly = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
function replace(next: SpeechSettings) {
  if (JSON.stringify(current) === JSON.stringify(next)) return;
  current = next;
  emit();
}
function readStorage() {
  if (typeof window === 'undefined' || sessionOnly) return;
  try {
    const raw = window.localStorage.getItem(SPEECH_SETTINGS_STORAGE_KEY);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw || 'null');
    } catch {
      parsed = null;
    }
    replace(normalizeSpeechSettings(parsed));
  } catch {
    /* Storage unavailable: retain working preferences for this session. */
  }
  initialized = true;
}
function snapshot() {
  if (!initialized) readStorage();
  return current;
}
function storageChanged(event: StorageEvent) {
  if (event.key === SPEECH_SETTINGS_STORAGE_KEY || event.key === null) {
    sessionOnly = false;
    readStorage();
  }
}
function subscribe(listener: () => void) {
  if (!listeners.size) {
    readStorage();
    window.addEventListener('storage', storageChanged);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener('storage', storageChanged);
  };
}
export function saveSpeechSettings(value: SpeechSettings) {
  const next = normalizeSpeechSettings(value);
  let persisted = false;
  try {
    window.localStorage.setItem(
      SPEECH_SETTINGS_STORAGE_KEY,
      JSON.stringify(next),
    );
    persisted = true;
  } catch {
    /* Session-only settings remain usable. */
  }
  initialized = true;
  sessionOnly = !persisted;
  replace(next);
  return persisted;
}
export function useSpeechSettings() {
  return useSyncExternalStore(
    subscribe,
    snapshot,
    () => DEFAULT_SPEECH_SETTINGS,
  );
}
