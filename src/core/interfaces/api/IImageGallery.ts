import { ImagesTypeEnum } from 'project/enum/imageGallery.enum';
import { ICompany } from './ICompany';

export type IImageGallery = {
  id: number;
  types: ImagesTypeEnum[];
  url: string;
  companyId: string;
  name: string;
  company: ICompany;
  created_at: Date;
  updated_at: Date;
};
