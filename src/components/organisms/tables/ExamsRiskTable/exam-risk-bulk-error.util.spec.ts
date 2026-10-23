import { bulkEditErrorMessage } from './exam-risk-bulk-error.util';

it('prefers a valid HTTP message, then the local error message', () => {
  expect(bulkEditErrorMessage({ response: { data: { message: 'Sem permissão' } }, message: 'HTTP' })).toBe('Sem permissão');
  expect(bulkEditErrorMessage(new Error('Falha local'))).toBe('Falha local');
  expect(bulkEditErrorMessage({ response: { data: { message: ['Inválido'] } }, message: 'HTTP' })).toBe('HTTP');
});

it.each([null, undefined, {}, 'erro', { response: null }, { response: { data: { message: 42 } } }])('handles an unknown error safely (%p)', error => {
  expect(bulkEditErrorMessage(error)).toBe('Não foi possível atualizar os vínculos.');
});
