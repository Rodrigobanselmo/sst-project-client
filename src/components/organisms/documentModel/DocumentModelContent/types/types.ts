import {
  NodeDocumentModelElementData,
  NodeDocumentModelSectionData,
} from '../../DocumentModelTree/types/types';

export type ITypeDocumentModel =
  | NodeDocumentModelSectionData
  | NodeDocumentModelElementData;
