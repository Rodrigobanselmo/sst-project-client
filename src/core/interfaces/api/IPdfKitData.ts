import { IPdfAsoData } from './IPdfAsoData';
import { IPdfProntuarioData, IProntuarioQuestion } from './IPdfProntuarioData';

export interface IPdfKitDataApi {
  aso: IPdfAsoData;
  prontuario: {
    questions: IProntuarioQuestion[];
    examination: IProntuarioQuestion[];
  };
}

export interface IPdfKitData {
  aso: IPdfAsoData;
  prontuario: IPdfProntuarioData;
}
