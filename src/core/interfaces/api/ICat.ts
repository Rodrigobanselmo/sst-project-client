import { StatusEnum } from 'project/enum/status.enum';

import { ICid } from './ICid';
import { IEmployee } from './IEmployee';
import {
  IEsocialTable13Body,
  IEsocialTable14And15Acid,
  IEsocialTable17Injury,
  IEsocialTable20Lograd,
  IEsocialTable6Country,
} from './IEsocial';
import { IESocialEvent } from './IEvent';
import { IProfessional } from './IProfessional';
import { ICities, IUf } from './IUFCities';

export type ICat = {
  id: number;
  dtAcid: Date;
  tpAcid: number;
  hrAcid: string;
  hrsTrabAntesAcid: string;
  tpCat: number;
  isIndCatObito: boolean;
  dtObito: Date;
  isIndComunPoliciaa: boolean;
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

  catOriginId: number;
  catOrigin?: ICat;
  catReopen?: ICat[];

  codCID: string;
  cid?: ICid;

  tpLograd: string;
  esocialLograd?: IEsocialTable20Lograd;

  pais: string;
  countryCodeEsocial6?: IEsocialTable6Country;

  uf: string;
  uf_table: IUf;

  codMunic: string;
  city?: ICities;

  codAgntCausador: string;
  esocialAgntCausador?: IEsocialTable14And15Acid;

  dscLesao: string;
  esocialLesao?: IEsocialTable17Injury;

  employeeId: number;
  employee?: IEmployee;

  codParteAting: string;
  codParteAtingEsocial13?: IEsocialTable13Body;
  status: StatusEnum;

  events: IESocialEvent[];
};

export const tpAcidList = [
  { value: 1, content: 'Típico' },
  { value: 2, content: 'Doença' },
  { value: 3, content: 'Trajeto' },
];

export const tpCatList = [
  { value: 1, content: 'Original' },
  { value: 2, content: 'Reabertura' },
  { value: 3, content: 'Comunicação de óbito' },
];

export const iniciatCATList = [
  { value: 1, content: 'Empregador' },
  { value: 2, content: 'Ordem judicial' },
  { value: 3, content: 'Determinação de órgão fiscalizador' },
];

export const tpLocalList = [
  { value: 1, content: 'Estabelecimento do empregador no Brasil' },
  { value: 2, content: 'Estabelecimento do empregador no exterior' },
  {
    value: 3,
    content: 'Estabelecimento de terceiros onde o empregador presta serviços',
  },
  { value: 4, content: 'Via pública' },
  { value: 5, content: 'Área rural' },
  { value: 6, content: 'Embarcação' },
  { value: 9, content: 'Outros' },
];

export const tpInscList = [
  { value: 1, content: 'CNPJ' },
  { value: 3, content: 'CAEPF' },
  { value: 4, content: 'CNO' },
];

export const lateralidadeList = [
  { value: '0', content: 'Não aplicável' },
  { value: '1', content: 'Esquerda' },
  { value: '2', content: 'Direita' },
  { value: '3', content: 'Ambas' },
];

export const getContentByCatListValue = (num: number | string, list: any[]) => {
  return list.find((x) => x.value == num)?.content;
};

export const isWithDeath = (num?: number) => [3].includes(num || 0); // tpCat

export const isDtObito = (indCatObito?: boolean) => indCatObito; // indCatObito

export const isHrsWorked = (num?: number) => [1, 3].includes(num || 0); // tpCat
export const isAskCompany = (num?: number) => [1, 3].includes(num || 0); // tpCat

export const isOriginCat = (num?: number, nrRecCatOrig?: string) =>
  nrRecCatOrig && [2, 3].includes(num || 0); // tpCat && nrRecCatOrig

export const isShowOriginCat = (num?: number) => [2, 3].includes(num || 0); // tpCat

export const isCepRequired = (num?: number) => [1, 3, 5].includes(num || 0); // tpLocal
export const isLocalEmpty = (num?: number) => [2].includes(num || 0); // tpLocal
export const isCityUfRequired = (num?: number) =>
  [1, 3, 4, 5].includes(num || 0); // tpLocal
export const isCountryRequired = (num?: number) => [2].includes(num || 0); // tpLocal
