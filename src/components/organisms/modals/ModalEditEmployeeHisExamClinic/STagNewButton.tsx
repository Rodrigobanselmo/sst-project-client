/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode } from 'react';

import { Box, Divider, Icon } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { SInput } from 'components/atoms/SInput';
import { SSwitch } from 'components/atoms/SSwitch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SelectForm } from 'components/molecules/form/select';
import { SIconDownloadExam } from 'components/molecules/SIconDownloadExam/SIconDownloadExam';
import { SIconUploadFile } from 'components/molecules/SIconUploadFile/SIconUploadFile';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ClinicInputSelect } from 'components/organisms/inputSelect/ClinicSelect/ClinicInputSelect';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';
import { ExamsComplementsClinicTable } from 'components/organisms/tables/ExamsComplementsClinicTable/ExamsComplementsClinicTable';
import { ExamsComplementsTable } from 'components/organisms/tables/ExamsComplementsTable/ExamsComplementsTable';
import { ExamSelect } from 'components/organisms/tagSelects/ExamSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { employeeExamConclusionTypeList } from 'project/enum/employee-exam-history-conclusion.enum';
import { employeeExamEvaluationTypeList } from 'project/enum/employee-exam-history-evaluation.enum';
import { employeeExamTypeList } from 'project/enum/employee-exam-history-type.enum';
import { SexTypeEnum } from 'project/enum/sex.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { SCheckIcon } from 'assets/icons/SCheckIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { SUploadFileIcon } from 'assets/icons/SUploadFileIcon';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { dateToDate } from 'core/utils/date/date-format';
import { getTimeList } from 'core/utils/helpers/times';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { timeMask } from 'core/utils/masks/date.mask';
import { intMask } from 'core/utils/masks/int.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { getSexLabel } from '../ModalAddExamSchedule/components/1-employee';
import { useAddData } from './hooks/useEditExamData';

export const STagNewButton: React.FC<{
  icon: React.ElementType<any>;
  text: string;
  borderColor: string;
  backgroundColor: string;
}> = ({
  icon = SCheckIcon,
  text,
  borderColor = 'success.main',
  backgroundColor = 'white',
}) => {
  return (
    <SFlex
      center
      sx={{
        borderRadius: 10,
        border: '1px solid',
        borderColor,
        backgroundColor,
        px: 4,
        height: 25,
        cursor: 'pointer',
        ':hover': {
          filter: 'brightness(0.9)',
        },
      }}
    >
      <Icon component={icon} sx={{ fontSize: 17, color: 'success.main' }} />
      <SText color={'grey.600'} fontSize={12}>
        {text}
      </SText>
    </SFlex>
  );
};
