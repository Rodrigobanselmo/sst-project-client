import dayjs from 'dayjs';

import { ICompany } from 'core/interfaces/api/ICompany';

export const isShouldDemissionBlock = (
  company: ICompany,
  {
    expiredDate,
    validityInMonths,
    doneDate: doneDateProp,
    dismissalDate,
  }: {
    expiredDate?: Date;
    doneDate?: Date;
    dismissalDate?: Date;
    validityInMonths?: number;
  },
) => {
  if (!company?.blockResignationExam) return false;

  const doneDate = doneDateProp
    ? dayjs(doneDateProp)
    : dayjs(expiredDate).add(-(validityInMonths || 0), 'months');
  const riskDegreeDays = getRiskDegreeBlockDays(company);
  const diff = doneDate
    ? Math.abs(doneDate.diff(dayjs(), 'day')) ?? 1000
    : 1000;

  if (diff > riskDegreeDays) {
    return false;
  }
  return true;
};

export const getRiskDegreeBlockDays = (company: ICompany) => {
  const riskDegreeDays = (company?.riskDegree ?? 1) >= 3 ? 135 : 90;
  return riskDegreeDays;
};
