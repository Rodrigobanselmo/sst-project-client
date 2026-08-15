/**
 * Política de fechamento dos dialogs de inventário químico.
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-dialog-close.util.spec.ts
 */
import { resolveChemicalDialogClose } from './chemical-dialog-close.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(
  resolveChemicalDialogClose({
    reason: 'escapeKeyDown',
    hasDraft: true,
    userConfirmedDiscard: false,
    nestedDialogOpen: true,
  }) === 'keep-open',
  'nested + Esc keeps parent open',
);
assert(
  resolveChemicalDialogClose({
    reason: 'backdropClick',
    hasDraft: true,
    userConfirmedDiscard: false,
    nestedDialogOpen: true,
  }) === 'keep-open',
  'nested + backdrop keeps parent open',
);
assert(
  resolveChemicalDialogClose({
    reason: 'closeButton',
    hasDraft: true,
    userConfirmedDiscard: false,
    nestedDialogOpen: true,
  }) === 'keep-open',
  'nested + Cancel keeps parent open',
);
assert(
  resolveChemicalDialogClose({
    reason: 'escapeKeyDown',
    hasDraft: true,
    userConfirmedDiscard: false,
  }) === 'ask-confirm',
  'Esc without nested still asks confirm',
);

console.log('chemical-dialog-close.util.spec.ts: OK');
