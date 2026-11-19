import {
  DEFAULT_SPEECH_SETTINGS,
  normalizeSpeechSettings,
} from './speech-settings.ts';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createLocalSpeechController,
  selectLocalPortugueseVoice,
  splitSpeechText,
} from './local-description-speech.ts';

const voice = (lang: string, localService = true) =>
  ({ lang, localService }) as SpeechSynthesisVoice;
function fixture() {
  const spoken: SpeechSynthesisUtterance[] = [];
  let cancels = 0;
  const synth = {
    speak: (item: SpeechSynthesisUtterance) => spoken.push(item),
    cancel: () => {
      cancels++;
    },
  } as unknown as SpeechSynthesis;
  return {
    spoken,
    get cancels() {
      return cancels;
    },
    control: createLocalSpeechController(
      synth,
      () => ({}) as SpeechSynthesisUtterance,
    ),
  };
}
test('selects local Brazilian Portuguese, permits local Portuguese and never a remote or unrelated voice', () => {
  const brazil = voice('pt-BR'),
    portugal = voice('pt-PT');
  assert.equal(
    selectLocalPortugueseVoice([voice('pt-BR', false), portugal, brazil]),
    brazil,
  );
  assert.equal(selectLocalPortugueseVoice([portugal]), portugal);
  assert.equal(
    selectLocalPortugueseVoice([voice('pt-BR', false), voice('en-US')]),
    undefined,
  );
});
test('chunks full long text without truncating content or speaking formatting/toolbars', () => {
  const text =
    'Descrição do processo. Máquinas e atividades já informadas.\n'.repeat(90);
  const parts = splitSpeechText(text);
  assert.ok(parts.length > 1 && parts.every((part) => part.length <= 300));
  assert.equal(
    parts.join(' ').replace(/\s+/g, ' ').trim(),
    text.replace(/\s+/g, ' ').trim(),
  );
});
test('plays all chunks sequentially with explicit local voice', () => {
  const f = fixture(),
    selected = voice('pt-BR');
  let stopped = 0;
  const text = 'Descrição local. '.repeat(100);
  f.control.speak(Symbol(), text, selected, {
    onStop: () => stopped++,
    onError: () => assert.fail('unexpected error'),
  });
  const expected = splitSpeechText(text);
  for (let index = 0; index < expected.length; index++) {
    assert.equal(f.spoken[index].text, expected[index]);
    assert.equal(f.spoken[index].voice, selected);
    f.spoken[index].onend?.({} as SpeechSynthesisEvent);
  }
  assert.equal(stopped, 1);
});
test('replacing a reader cancels old playback and ignores its late callbacks', () => {
  const f = fixture(),
    first = Symbol(),
    second = Symbol();
  let stopped = 0;
  f.control.speak(first, 'Primeiro. '.repeat(100), voice('pt-BR'), {
    onStop: () => stopped++,
    onError: () => assert.fail('stale callback'),
  });
  const stale = f.spoken[0];
  f.control.speak(second, 'Segundo', voice('pt-BR'), {
    onStop: () => stopped++,
    onError: () => assert.fail('error'),
  });
  assert.equal(f.cancels, 1);
  assert.equal(stopped, 1);
  stale.onend?.({} as SpeechSynthesisEvent);
  stale.onerror?.({} as SpeechSynthesisErrorEvent);
  f.control.stop(first);
  assert.equal(f.cancels, 1);
  assert.equal(f.spoken.length, 2);
  f.control.stop(second);
  assert.equal(f.cancels, 2);
  assert.equal(stopped, 2);
});
test('remote voices are rejected before speaking and errors do not fall back', () => {
  const f = fixture();
  let failed = 0;
  assert.throws(() =>
    f.control.speak(Symbol(), 'Texto', voice('pt-BR', false), {
      onStop() {},
      onError() {},
    }),
  );
  assert.equal(f.spoken.length, 0);
  f.control.speak(Symbol(), 'Texto', voice('pt-BR'), {
    onStop() {},
    onError: () => failed++,
  });
  f.spoken[0].onerror?.({} as SpeechSynthesisErrorEvent);
  assert.equal(failed, 1);
  assert.equal(f.spoken.length, 1);
  assert.equal(f.cancels, 1);
});

test('settings accept safe values and reject malformed persisted values without coercion', () => {
  assert.deepEqual(
    normalizeSpeechSettings({
      voiceURI: 'local-pt',
      rate: 1.25,
      pitch: 0.8,
      volume: 0,
    }),
    { voiceURI: 'local-pt', rate: 1.25, pitch: 0.8, volume: 0 },
  );
  for (const invalid of [
    null,
    [],
    'invalid',
    { rate: Infinity, pitch: -1, volume: 2 },
    { rate: '1.5', pitch: null, volume: NaN, voiceURI: 'x'.repeat(513) },
  ])
    assert.deepEqual(normalizeSpeechSettings(invalid), DEFAULT_SPEECH_SETTINGS);
});
test('chosen settings are assigned to every chunk, including intentional zero volume and pitch', () => {
  const f = fixture();
  const chosen = { voiceURI: 'local', rate: 1.5, pitch: 0, volume: 0 };
  f.control.speak(
    Symbol(),
    'Leitura longa. '.repeat(100),
    voice('pt-BR'),
    {
      onStop() {},
      onError() {
        assert.fail('unexpected error');
      },
    },
    chosen,
  );
  const count = splitSpeechText('Leitura longa. '.repeat(100)).length;
  for (let index = 0; index < count; index++) {
    assert.equal(f.spoken[index].rate, chosen.rate);
    assert.equal(f.spoken[index].pitch, 0);
    assert.equal(f.spoken[index].volume, 0);
    f.spoken[index].onend?.({} as SpeechSynthesisEvent);
  }
});
test('a saved unavailable or remote voice is not replaced silently', () => {
  const chosen = { ...voice('pt-PT'), voiceURI: 'selected' };
  assert.equal(
    selectLocalPortugueseVoice([voice('pt-BR'), chosen], 'selected'),
    chosen,
  );
  assert.equal(
    selectLocalPortugueseVoice(
      [{ ...chosen, localService: false }],
      'selected',
    ),
    undefined,
  );
  assert.equal(selectLocalPortugueseVoice([chosen], 'missing'), undefined);
});
