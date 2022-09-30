import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ICompany, IWorkspace } from './ICompany';

export type IDocument = {
  id: number;
  fileUrl: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: DocumentTypeEnum;
  status: StatusEnum;
  created_at: Date;
  updated_at: Date;
  companyId: string;
  workspaceId: string;
  workspace: IWorkspace;
  company: ICompany;
  oldDocuments: IDocument[];
  parentDocumentId: number;
  parentDocument: IDocument;
};
