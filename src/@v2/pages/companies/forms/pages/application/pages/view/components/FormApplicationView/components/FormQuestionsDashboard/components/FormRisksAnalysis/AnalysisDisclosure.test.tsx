import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderAnalysisOriginGroups } from './AnalysisDisclosure';

test('separa seleção manual sem confundir catálogo sugerido pela IA e preserva índices', () => {
  const html = renderToStaticMarkup(<>{renderAnalysisOriginGroups([
    { nome: 'Sugestão do catálogo', justificativa: 'Análise técnica' },
    { nome: 'Manual anterior', justificativa: 'Selecionado manualmente do catálogo pelo responsável técnico.' },
    { nome: 'Manual atual', justificativa: 'Alterada', selectionOrigin: 'USER' },
  ], (item, index) => <span key={index}>{index}:{item.nome}</span>)}</>);
  assert.match(html, /Adicionados pela IA/);
  assert.match(html, /Adicionados pelo usuário/);
  assert.match(html, /1:Manual anterior/);
  assert.match(html, /2:Manual atual/);
  const empty = renderToStaticMarkup(<>{renderAnalysisOriginGroups([], () => null)}</>);
  assert.equal(empty, '');
});
