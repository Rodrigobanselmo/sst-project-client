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
import { SendEvent2210ESocialTable } from 'components/organisms/tables/SendEvent2210ESocialTable/SendEvent2210ESocialTable';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import sortArray from 'sort-array';

import SEventIcon from 'assets/icons/SEventIcon/SEventIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutSendESocialEvent2210 } from 'core/services/hooks/mutations/esocial/events/useMutSendESocialEvent2210/useMutSendESocialEvent2210';
import { useQueryEvent2210 } from 'core/services/hooks/queries/useQueryEvent2210/useQueryEvent2210';

export const initialSendESocial2210State = {
  title: '',
  companyId: '',
  company: null as ICompany | null,
  onSelect: (d: any) => {},
  onCloseWithoutSelect: () => {},
};

const modalEnum = ModalEnum.MODAL_SEND_ESOCIAL_2210;

export const ModalSend2210ESocial: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { push } = useRouter();
  const { onCloseModal } = useModal();
  const [data, setData] = useState(initialSendESocial2210State);
  const sendMut2210 = useMutSendESocialEvent2210();
  const {
    data: event2210,
    count,
    error,
  } = useQueryEvent2210(1, {
    companyId: data.companyId,
  });

  useEffect(() => {
    const initialData = getModalData(
      modalEnum,
    ) as typeof initialSendESocial2210State;

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
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
    setData(initialSendESocial2210State);
  };

  const onCloseNoSelect = () => {
    data.onCloseWithoutSelect?.();
    onClose();
  };

  const onSubmit = () => {
    data.onSelect?.(data);
    if (data.companyId) {
      sendMut2210
        .mutateAsync({ companyId: data.companyId })
        .then(() => {
          onClose();
        })
        .catch(() => null);
    }
  };

  const eventsOks = useMemo(() => {
    return sortArray(event2210, {
      by: ['error', 'name', 'doneDate'],
      order: ['desc', 'desc', 'desc'],
      computed: {
        error: (row) => row?.errors?.length != 0,
        name: (row) => row.employee.name,
      },
    });
  }, [event2210]);

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
      loading: sendMut2210.isLoading,
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
              <SendEvent2210ESocialTable
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
