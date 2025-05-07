import { FileModel } from '@v2/models/.shared/models/file.model';
import {
  DocumentControlFileBrowseResultModel,
  IDocumentControlFileBrowseResultModel,
} from '../document-control-file/document-control-file-browse-result.model';

export type IDocumentControlReadModel = {
  id: number;
  companyId: string;
  name: string;
  type: string;
  description: string | undefined;
  createdAt: Date;
  updatedAt: Date;

  files: IDocumentControlFileBrowseResultModel[];
};

export class DocumentControlReadModel {
  id: number;
  companyId: string;
  name: string;
  type: string;
  description: string | undefined;
  createdAt: Date;
  updatedAt: Date;

  files: DocumentControlFileBrowseResultModel[];

  constructor(params: IDocumentControlReadModel) {
    this.companyId = params.companyId;
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;

    this.files = params.files.map(
      (file) => new DocumentControlFileBrowseResultModel(file),
    );
  }

  get url() {
    return this.files[0]?.file.url;
  }
}
