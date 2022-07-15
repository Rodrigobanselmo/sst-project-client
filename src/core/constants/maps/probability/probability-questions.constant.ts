/* eslint-disable @typescript-eslint/no-explicit-any */
import { RiskEnum } from 'project/enum/risk.enums';
import { SeverityEnum } from 'project/enum/severity.enums';

import {
  chanceOfContactMap,
  IChanceOfContactOption,
} from './chance-of-contact.map';
import { frequencyMap, IFrequencyOption } from './frequency.map';
import {
  historyOccurrencesMap,
  IHistoryOccurrencesOption,
} from './history-occurrences.map';
import { intensityMap } from './intensity.map';
import { IMeasuresOption, measuresMap } from './measures.map';

export enum ProbabilityQuestionEnum {
  INTENSITY,
  INTENSITY_RESULT,
  DURATION,
  EMPLOYEES,
  CHANCE,
  FREQUENCY,
  HISTORY,
  MEASURE,
}

export interface IProbabilityQuestion {
  title: string;
  text: string;
  acceptRiskTypesForSelect?: string[];
  data?: Record<
    SeverityEnum,
    {
      value: SeverityEnum;
      name: string;
    }
  >;
}

export interface IProbabilityQuestions
  extends Record<ProbabilityQuestionEnum, IProbabilityQuestion> {}

export const probabilityQuestionsMap = {
  [ProbabilityQuestionEnum.DURATION]: {
    title: 'Duração da exposição ou da condição de risco',
    text: '(Relação direta entre Duração da Jorna (minutos) / Duração da Exposição Ocupacional-OE (Minutos))',
  },
  [ProbabilityQuestionEnum.EMPLOYEES]: {
    title: 'Número de trabalhadores possivelmente afetados',
    text: '(Relação direta entre o Número de Empregados do Estabelecimento / Número de Empregados do GSE',
  },
  [ProbabilityQuestionEnum.CHANCE]: {
    data: Object.values<IChanceOfContactOption>(chanceOfContactMap).sort(
      (a, b) => a.value - b.value,
    ),
    title: 'Chance de Contato ou Ocorrência',
    text: '(Em condições normais de trabalho)',
  },
  [ProbabilityQuestionEnum.FREQUENCY]: {
    data: Object.values<IFrequencyOption>(frequencyMap).sort(
      (a, b) => a.value - b.value,
    ),
    title: 'Frequência',
    text: '(Considera a habitualidade da exposição)',
  },
  [ProbabilityQuestionEnum.HISTORY]: {
    data: Object.values<IHistoryOccurrencesOption>(historyOccurrencesMap).sort(
      (a, b) => a.value - b.value,
    ),
    title: 'Histórico de ocorrências',
    text: '(Considera as estatísticas de acidentes e registros de Doenças Ocupacionais)',
  },
  [ProbabilityQuestionEnum.MEASURE]: {
    data: Object.values<IMeasuresOption>(measuresMap).sort(
      (a, b) => a.value - b.value,
    ),
    title: 'Medidas de prevenção implementadas',
    text: '(Considera as hierarquias das medidas de controles)',
  },
};
