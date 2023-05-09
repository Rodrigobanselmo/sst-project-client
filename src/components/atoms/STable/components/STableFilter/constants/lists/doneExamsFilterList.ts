import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { StatusEnum } from 'project/enum/status.enum';
import { FilterFieldEnum } from '../filter.map';

export const doneExamsFilterList = {
  fields: [
    FilterFieldEnum.CLINICS,
    FilterFieldEnum.EXAM_TYPE,
    FilterFieldEnum.EVALUATION_TYPE,
    FilterFieldEnum.COMPANIES,
    FilterFieldEnum.COMPANIES_GROUP,
    FilterFieldEnum.START_DATE,
    FilterFieldEnum.END_DATE,
    FilterFieldEnum.EXAM_AVALIATION_EXAM,
    FilterFieldEnum.STATUS,
  ],
  statusOptions: [
    StatusEnum.DONE,
    StatusEnum.PROCESSING,
    StatusEnum.EXPIRED,
    StatusEnum.CANCELED,
  ],
  statusSchema: statusOptionsConstantExam,
};
