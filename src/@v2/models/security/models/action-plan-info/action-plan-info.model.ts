import { dateUtils } from '@v2/utils/date-utils';

export type IActionPlanInfoModel = {
  validityStart: Date | null;
  validityEnd: Date | null;
  periods: {
    monthsLevel_2: number;
    monthsLevel_3: number;
    monthsLevel_4: number;
    monthsLevel_5: number;
  };
  coordinator: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export class ActionPlanInfoModel {
  validityStart: Date | null;
  validityEnd: Date | null;
  periods: {
    monthsLevel_2: number;
    monthsLevel_3: number;
    monthsLevel_4: number;
    monthsLevel_5: number;
  };
  coordinator: {
    id: number;
    name: string;
    email: string;
  } | null;

  constructor(params: IActionPlanInfoModel) {
    this.validityStart = params.validityStart
      ? new Date(params.validityStart)
      : null;
    this.validityEnd = params.validityEnd ? new Date(params.validityEnd) : null;
    this.periods = {
      monthsLevel_2: params.periods.monthsLevel_2,
      monthsLevel_3: params.periods.monthsLevel_3,
      monthsLevel_4: params.periods.monthsLevel_4,
      monthsLevel_5: params.periods.monthsLevel_5,
    };
    this.coordinator = params.coordinator;
  }

  get validityStartFormatted() {
    if (!this.validityStart) return '';

    return dateUtils(this.validityStart).format('DD [de] MMMM [de] YYYY');
  }

  get validityEndFormatted() {
    if (!this.validityEnd) return '';

    return dateUtils(this.validityEnd).format('DD [de] MMMM [de] YYYY');
  }

  get coordinatorName() {
    return this.coordinator?.name || 'Não definido';
  }
}
