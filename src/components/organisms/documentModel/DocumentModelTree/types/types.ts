import {
  IDocumentModelElement,
  IDocumentModelSection,
} from 'core/interfaces/api/IDocumentModel';

import { NodeModel } from '../../../../dnd-tree/Main';

export type NodeDocumentModelSectionData = {
  type: string;
  section: true;
} & IDocumentModelSection;

export type NodeDocumentModelElementData = {
  element: true;
} & IDocumentModelElement;

export type NodeDocumentModel = NodeModel<
  NodeDocumentModelSectionData | NodeDocumentModelElementData
>;
