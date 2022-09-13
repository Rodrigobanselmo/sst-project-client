import dayjs from 'dayjs';

import { ICompany } from 'core/interfaces/api/ICompany';

export const isShouldDemissionBlock = (
  company: ICompany,
  {
    expiredDate,
    validityInMonths,
  }: { expiredDate?: Date; validityInMonths?: number },
) => {
  if (!company?.blockResignationExam) return false;

  const doneDate = dayjs(expiredDate).add(-(validityInMonths || 0), 'months');

  const riskDegreeDays = (company?.riskDegree ?? 1) >= 3 ? 135 : 90;
  const diff = Math.abs(doneDate.diff(dayjs(), 'day')) || 1000;

  if (diff > riskDegreeDays) {
    return false;
  }
  return true;
};
