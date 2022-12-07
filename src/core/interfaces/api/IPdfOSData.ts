import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IOs } from 'core/interfaces/api/IOs';
import {
  IEngsRiskData,
  IGenerateSource,
  IRecMed,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';

import { ICompany } from './ICompany';
import { IEmployee } from './IEmployee';
import { IEpiRiskData } from './IEpi';
import { IRiskData } from './IRiskData';

export interface IPdfOSData {
  employee: IEmployee;
  consultantCompany: ICompany;
  actualCompany: ICompany;
  sector: IHierarchy;
  risks: {
    riskData: IRiskData;
    riskFactor: IRiskFactors;
  }[];
  epis: IEpiRiskData[];
  epcs: IEngsRiskData[];
  adms: IRecMed[];
  font: Record<string, IGenerateSource[]>;
  os: IOs;
}
