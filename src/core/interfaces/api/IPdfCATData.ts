import { ICat } from './ICat';
import { ICompany } from './ICompany';
import { IEmployee } from './IEmployee';

export interface IPdfCATData {
  employee: IEmployee;
  company: ICompany;
  cat: ICat;
}
