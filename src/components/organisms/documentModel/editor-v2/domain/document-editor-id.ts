import { v4 as uuidv4 } from 'uuid';

export type DocumentEditorIdFactory = () => string;

export function createDocumentEditorId(
  factory: DocumentEditorIdFactory = uuidv4,
): string {
  return factory();
}

export function createSequentialIdFactory(
  prefix = 'new',
): DocumentEditorIdFactory {
  let index = 0;
  return () => `${prefix}-${++index}`;
}
