/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SLink from 'components/atoms/SLink/SLink';
import STableTopDivider from 'components/atoms/STable/components/STableTopDivider/STableTopDivider';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { SendEventESocialTable } from 'components/organisms/tables/SendEventESocialTable/SendEventESocialTable';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { EmployeeESocialEventTypeEnum } from 'project/enum/esocial-event-type.enum';

import SEventIcon from 'assets/icons/SEventIcon/SEventIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutSendESocialEvent2220 } from 'core/services/hooks/mutations/esocial/2220/useMutSendESocialEvent2220/useMutSendESocialEvent2220';
import { useQueryEvent2220 } from 'core/services/hooks/queries/useQueryEvent2220/useQueryEvent2220';
import { sortDate } from 'core/utils/sorts/data.sort';
import { sortNumber } from 'core/utils/sorts/number.sort';

export const initialSendESocialState = {
  title: '',
  companyId: '',
  type: '' as EmployeeESocialEventTypeEnum,
  company: null as ICompany | null,
  onSelect: (d: any) => {},
  onCloseWithoutSelect: () => {},
};

const modalEnum = ModalEnum.MODAL_SEND_ESOCIAL;

export const ModalSendESocial: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { push } = useRouter();
  const { onCloseModal } = useModal();
  const [data, setData] = useState(initialSendESocialState);
  const sendMut2220 = useMutSendESocialEvent2220();
  const {
    data: event2220,
    count,
    error,
  } = useQueryEvent2220(1, {
    companyId: data.companyId,
  });

  useEffect(() => {
    const initialData = getModalData(
      modalEnum,
    ) as typeof initialSendESocialState;

    if (initialData) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(modalEnum);
    setData(initialSendESocialState);
  };

  const onCloseNoSelect = () => {
    data.onCloseWithoutSelect?.();
    onClose();
  };

  const onSubmit = () => {
    data.onSelect?.(data);
    if (data.companyId) {
      if (data.type === EmployeeESocialEventTypeEnum.EXAM_2220) {
        sendMut2220
          .mutateAsync({ companyId: data.companyId })
          .then(() => {
            onClose();
          })
          .catch(() => null);
      }
    }
  };

  const eventsOks = useMemo(() => {
    return event2220
      .sort((a, b) => sortNumber(b.errors.length, a.errors.length))
      .sort((a, b) => sortDate(a.doneDate, b.doneDate));
  }, [event2220]);

  const buttons = [
    {
      variant: 'outlined',
      text: 'Calcelar',
      onClick: () => onCloseNoSelect(),
    },
    {
      text: 'Enviar',
      variant: 'contained',
      onClick: () => onSubmit(),
      loading: sendMut2220.isLoading,
    },
  ] as IModalButton[];

  if (error?.message) buttons.pop();

  return (
    <SModal
      {...registerModal(modalEnum)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper sx={{ backgroundColor: 'grey.200' }} center p={8}>
        <SModalHeader
          onClose={onCloseNoSelect}
          title="Enviar eventos"
          tagTitle=" "
        />

        <Box mt={8} mb={20}>
          {error?.message && (
            <>
              <SText mb={10}>{error?.message}</SText>
              <NextLink
                passHref
                href={`${RoutesEnum.COMPANIES}/${data.companyId}`}
              >
                <SLink unstyled>
                  <SButton onClick={() => onClose()}>Editar empresa</SButton>
                </SLink>
              </NextLink>
            </>
          )}
          {!error?.message && (
            <>
              <STableTopDivider
                mt={10}
                content={'Eventos disponiveis para envio'}
                iconProps={{ sx: { color: 'grey.600', fontSize: 18 } }}
                icon={SEventIcon}
              />
              <SendEventESocialTable
                company={data.company || undefined}
                events={eventsOks}
              />
            </>
          )}
        </Box>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};

// <STableTopDivider
//   content={'Eventos com erros de formatação'}
//   icon={SCloseIcon}
//   iconProps={{ sx: { color: 'error.main' } }}
// />
// <SendEventESocialTable
//   events={eventsWithErrors}
//   company={data.company || undefined}
// />
// <STableTopDivider
//   mt={10}
//   content={'Eventos prontos para serem enviados'}
//   iconProps={{ sx: { color: 'success.main' } }}
//   icon={SCheckIcon}
// />
// <SendEventESocialTable
//   company={data.company || undefined}
//   events={eventsOks}
// />
