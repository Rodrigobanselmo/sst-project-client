import { RiskEnum } from 'project/enum/risk.enums';

export type IEsocialTable18Mot = {
  id: number;
  code: string;
  description: string;
};

export type IEsocialTable6Country = {
  code: string;
  name: string;
};

export type IEsocialTable13Body = {
  code: string;
  desc: string;
};

export type IEsocialTable14And15Acid = {
  code: string;
  desc: string;
  case: string | null;
  table: number;
};

export type IEsocialTable17Injury = {
  code: string;
  desc: string;
};

export type IEsocialTable20Lograd = {
  code: string;
  desc: string;
};

export type IEsocialTable24 = {
  id: string;
  name: string;
  group: string;
  type: RiskEnum;
  isQuantity: boolean;
};
