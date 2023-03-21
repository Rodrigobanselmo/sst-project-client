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
import { SendEvent2240ESocialTable } from 'components/organisms/tables/SendEvent2240ESocialTable/SendEvent2240ESocialTable';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import sortArray from 'sort-array';

import SEventIcon from 'assets/icons/SEventIcon/SEventIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutSendESocialEvent2240 } from 'core/services/hooks/mutations/esocial/events/useMutSendESocialEvent2240 /useMutSendESocialEvent2240';
import { useQueryEvent2240 } from 'core/services/hooks/queries/useQueryEvent2240/useQueryEvent2240';

export const initialSendESocial2240State = {
  title: '',
  companyId: '',
  company: null as ICompany | null,
  onSelect: (d: any) => {},
  onCloseWithoutSelect: () => {},
};

const modalEnum = ModalEnum.MODAL_SEND_ESOCIAL_2240;

export const ModalSend2240ESocial: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { push } = useRouter();
  const { onCloseModal } = useModal();
  const [data, setData] = useState(initialSendESocial2240State);
  const sendMut2240 = useMutSendESocialEvent2240();
  const {
    data: event2240,
    count,
    error,
  } = useQueryEvent2240(1, {
    companyId: data.companyId,
  });

  useEffect(() => {
    const initialData = getModalData(
      modalEnum,
    ) as typeof initialSendESocial2240State;

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
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
    setData(initialSendESocial2240State);
  };

  const onCloseNoSelect = () => {
    data.onCloseWithoutSelect?.();
    onClose();
  };

  const onSubmit = () => {
    data.onSelect?.(data);
    if (data.companyId) {
      sendMut2240
        .mutateAsync({ companyId: data.companyId })
        .then(() => {
          onClose();
        })
        .catch(() => null);
    }
  };

  const eventsOks = useMemo(() => {
    return sortArray(event2240, {
      by: ['error', 'name', 'doneDate'],
      order: ['desc', 'desc', 'desc'],
      computed: {
        error: (row) => row?.errors?.length != 0,
        name: (row) => row.employee.name,
      },
    });
  }, [event2240]);

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
      loading: sendMut2240.isLoading,
    },
  ] as IModalButton[];

  if (error?.message) buttons.pop();

  return (
    <SModal
      {...registerModal(modalEnum)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper semiFullScreen center p={8}>
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
                href={RoutesEnum.COMPANY.replace(':companyId', data.companyId)}
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
              <SendEvent2240ESocialTable
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
