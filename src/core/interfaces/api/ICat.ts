import { StatusEnum } from 'project/enum/status.enum';

import { ICid } from './ICid';
import { IEmployee } from './IEmployee';
import {
  IEsocialTable13BodyPart,
  IEsocialTable14And15Acid,
  IEsocialTable17Injury,
  IEsocialTable20Lograd,
  IEsocialTable6Country,
} from './IEsocial';
import { IProfessional } from './IProfessional';
import { Cities, Uf } from './IUFCities';

export type ICat = {
  id: number;
  dtAcid: Date;
  tpAcid: number;
  hrAcid: string;
  hrsTrabAntesAcid: string;
  tpCat: number;
  isIndCatObito: boolean;
  dtObito: Date;
  isIndComunPolicia: boolean;
  iniciatCAT: number;
  obsCAT: string;
  ultDiaTrab: Date;
  houveAfast: boolean;
  tpLocal: number;
  dscLocal: string;
  dscLograd: string;
  nrLograd: string;
  complemento: string;
  bairro: string;
  cep: string;
  codPostal: string;
  ideLocalAcidTpInsc: number;
  ideLocalAcidCnpj: string;
  lateralidade: number;
  dtAtendimento: Date;
  hrAtendimento: string;
  isIndInternacao: boolean;
  durTrat: number;
  isIndAfast: boolean;
  dscCompLesao: string;
  diagProvavel: string;
  observacao: string;
  nrRecCatOrig: string;

  codSitGeradora: string;
  esocialSitGeradora?: IEsocialTable14And15Acid;

  docId: number;
  doc?: IProfessional;

  codCID: string;
  cid?: ICid;

  tpLograd: string;
  esocialLograd?: IEsocialTable20Lograd;

  pais: string;
  countryCodeEsocial6?: IEsocialTable6Country;

  uf: string;
  uf_table: Uf;

  codMunic: string;
  city?: Cities;

  codAgntCausador: string;
  esocialAgntCausador?: IEsocialTable14And15Acid;

  dscLesao: string;
  esocialLesao?: IEsocialTable17Injury;

  employeeId: number;
  employee?: IEmployee;

  codParteAting: string;
  codParteAtingEsocial13?: IEsocialTable13BodyPart;
  status: StatusEnum;
};
