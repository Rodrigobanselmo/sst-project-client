/**
 * Executar: npx tsx --test .../frps-explainability.form-no-validate.test.ts
 *
 * Garante que o drawer do formulário não oferece mais ações de validação
 * conceitual (movidas para a Biblioteca FRPS).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const drawerSource = readFileSync(
  join(dir, 'FrpsExplainabilityDrawer.tsx'),
  'utf8',
);

describe('FRPS form drawer — no conceptual validate actions (v1)', () => {
  it('10) does not render Validar conteúdo / Rejeitar / Salvar e validar', () => {
    assert.doesNotMatch(drawerSource, /text="Validar conteúdo"/);
    assert.doesNotMatch(drawerSource, /text="Rejeitar conteúdo"/);
    assert.doesNotMatch(drawerSource, /text="Salvar e validar"/);
    assert.match(drawerSource, /Biblioteca FRPS/);
  });

  it('keeps edit draft action available for MASTER', () => {
    assert.match(drawerSource, /text="Editar conteúdo"/);
    assert.match(drawerSource, /text="Salvar rascunho"/);
  });
});
