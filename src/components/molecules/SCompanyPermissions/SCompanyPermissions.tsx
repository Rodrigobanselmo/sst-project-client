import React from 'react';

import { Box, BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { CnaeInputSelect } from 'components/organisms/inputSelect/CnaeSelect/CnaeSelect';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { CompanyTypesEnum } from 'project/enum/company-type.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { companyOptionsConstant } from 'core/constants/maps/company.constant';
import { useAccess } from 'core/hooks/useAccess';
import { dateToDate } from 'core/utils/date/date-format';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { phoneMask } from 'core/utils/masks/phone.mask';

import { IUseAddCompany } from '../../organisms/modals/company/ModalEditCompany/hooks/useEditCompany';
import { useCompanyEdit } from '../../organisms/modals/company/ModalEditCompany/components/1-data/hooks/useCompanyFirstEdit';
import { PermissionCompanyEnum } from 'project/enum/permissionsCompany';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';

export const CompanyPermissions = ({
  permissions,
  setPermissions,
  userCompany,
  ...props
}: BoxProps & {
  permissions: string[];
  userCompany: ICompany;
  setPermissions: (p: string[]) => void;
}) => {
  const { isValidRoles } = useAccess();

  return (
    <SFlex display={'grid'} gridTemplateColumns={'1fr 1fr 1fr'} {...props}>
      {isValidRoles([RoleEnum.CONTRACTS, RoleEnum.MASTER]) && (
        <>
          {[
            {
              label: 'Acesso ao PGR, PCMSO, etc...',
              item: PermissionCompanyEnum.document,
            },
            {
              label: 'Acesso ao eSocial',
              item: PermissionCompanyEnum.esocial,
            },
            {
              label: 'Acesso ao Agendamento',
              item: PermissionCompanyEnum.schedule,
            },
            { label: 'Acesso à CAT', item: PermissionCompanyEnum.cat },
            {
              label: 'Acesso ao Absenteísmo',
              item: PermissionCompanyEnum.absenteeism,
            },
          ].map(({ item, label }) => {
            if (!userCompany.permissions?.includes(item)) return null;

            const includesPermission = !!permissions?.includes(item);

            const newPermissions = includesPermission
              ? permissions?.filter((p) => p !== item)
              : [...(permissions || []), item];

            return (
              <SSwitch
                key={item}
                onChange={(e) => {
                  setPermissions(newPermissions);
                }}
                checked={includesPermission}
                label={label}
                sx={{ mr: 4 }}
                color="text.light"
              />
            );
          })}
        </>
      )}
    </SFlex>
  );
};

export const SCompanyPermissions = (props: BoxProps) => {
  const updateCompany = useMutUpdateCompany();
  const { userCompanyId } = useGetCompanyId();
  const { data: userCompany } = useQueryCompany(userCompanyId);
  const { data: company } = useQueryCompany();

  return (
    <>
      {userCompany && (
        <CompanyPermissions
          permissions={company.permissions || []}
          userCompany={userCompany}
          setPermissions={(permissions) => {
            updateCompany.mutate({
              id: company.id,
              permissions,
            });
          }}
          {...props}
        />
      )}
    </>
  );
};
