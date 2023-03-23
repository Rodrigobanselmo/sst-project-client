import { ReactNode } from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { IContact } from 'core/interfaces/api/IContact';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';

export interface IClinicScheduleOption {
  value: ClinicScheduleTypeEnum;
  name: string;
  message?: (contact?: IContact, options?: { hideText?: boolean }) => ReactNode;
}
interface IClinicScheduleOptions
  extends Record<ClinicScheduleTypeEnum, IClinicScheduleOption> {}

export const getContacts = ({
  scheduleType,
  contact,
}: {
  scheduleType: ClinicScheduleTypeEnum;
  contact: IContact;
}) => {
  if (scheduleType == ClinicScheduleTypeEnum.ONLINE) return null;
  if (scheduleType == ClinicScheduleTypeEnum.NONE) return null;
  if (scheduleType == ClinicScheduleTypeEnum.ASK) return null;

  if (scheduleType != ClinicScheduleTypeEnum.EMAIL)
    return [
      contact?.phone ? ['Telefone', contact.phone] : '',
      contact?.phone_1 ? ['Telefone 2', contact.phone_1] : '',
      // contact?.email ? ['Email', contact.email] : '',
    ].filter((i) => i);

  return [
    contact?.email ? ['Email', contact.email] : '',
    // contact?.phone ? ['Telefone', contact.phone] : '',
    // contact?.phone_1 ? ['Telefone 2', contact.phone_1] : '',
  ].filter((i) => i);
};

export const clinicScheduleMap = {
  [ClinicScheduleTypeEnum.PHONE]: {
    value: ClinicScheduleTypeEnum.PHONE,
    name: 'Telefone',
    message: (contact, options) => {
      return (
        <>
          <SText mt={1} lineHeight={1.1} fontSize={13}>
            <SText
              component={'span'}
              fontWeight="500"
              fontSize={13}
              color="primary.main"
            >
              Instruções:
            </SText>{' '}
            Clínica com agendamento via <u>Telefone</u>. <br />
            {!options?.hideText && (
              <>
                <SFlex gap={'2px 20px'} flexWrap="wrap">
                  {contact &&
                    getContacts({
                      scheduleType: ClinicScheduleTypeEnum.PHONE,
                      contact,
                    })?.map(([type, text]: any) => {
                      return (
                        <SText key={type} fontSize={13}>
                          <SText
                            fontWeight="500"
                            component={'span'}
                            fontSize={13}
                          >
                            {type}:
                          </SText>{' '}
                          {text}
                        </SText>
                      );
                    })}
                </SFlex>
                <SText fontSize={11} lineHeight={1} component={'span'}>
                  Entre em contato com a clínica para agendar o exame e obter
                  data e hora da realização para emissão da Guia de
                  Encaminhamento!
                </SText>
              </>
            )}
          </SText>
        </>
      );
    },
  },
  [ClinicScheduleTypeEnum.EMAIL]: {
    value: ClinicScheduleTypeEnum.EMAIL,
    name: 'Email',
    message: (contact, options) => {
      return (
        <>
          <SText mt={1} fontSize={13} lineHeight={1.1}>
            <SText
              component={'span'}
              fontWeight="500"
              fontSize={13}
              color="primary.main"
            >
              Instruções:
            </SText>{' '}
            Clínica com agendamento via <u>EMAIL</u>. <br />
            {!options?.hideText && (
              <>
                <SFlex gap={'2px 20px'} mt={-1} mb={2} flexWrap="wrap">
                  {contact &&
                    getContacts({
                      scheduleType: ClinicScheduleTypeEnum.EMAIL,
                      contact,
                    })?.map(([type, text]: any) => {
                      return (
                        <SText key={type} fontSize={13}>
                          <SText
                            fontWeight="500"
                            component={'span'}
                            fontSize={13}
                          >
                            {type}:
                          </SText>{' '}
                          {text}
                        </SText>
                      );
                    })}
                </SFlex>
                <SText lineHeight={1} fontSize={11} component={'span'}>
                  Entre em contato com a clínica para agendar o exame e obter
                  data e hora da realização para emissão da Guia de
                  Encaminhamento!
                </SText>
              </>
            )}
          </SText>
        </>
      );
    },
  },
  [ClinicScheduleTypeEnum.ONLINE]: {
    value: ClinicScheduleTypeEnum.ONLINE,
    name: 'Online (Sistema)',
  },
  [ClinicScheduleTypeEnum.ASK]: {
    value: ClinicScheduleTypeEnum.ASK,
    name: 'Pedido de Agenda (Sistema)',
    message: (c, options) => {
      return (
        <>
          <SText mt={1} fontSize={13} lineHeight={1.1}>
            <SText
              component={'span'}
              fontWeight="500"
              fontSize={13}
              color="primary.main"
            >
              Instruções:
            </SText>{' '}
            Clínica com agendamento via <u>Pedido de Angenda</u>. <br />
            {!options?.hideText && (
              <SText lineHeight={1} fontSize={11} component={'span'}>
                Selecione a melhor data para realizar o exame e caso haja alguma
                informação adcional informe no campo de observações abaixo
              </SText>
            )}
          </SText>
        </>
      );
    },
  },
  [ClinicScheduleTypeEnum.NONE]: {
    value: ClinicScheduleTypeEnum.NONE,
    name: 'Sem Agendamento',
  },
} as IClinicScheduleOptions;

export const clinicScheduleOptionsList = [
  clinicScheduleMap[ClinicScheduleTypeEnum.PHONE],
  clinicScheduleMap[ClinicScheduleTypeEnum.EMAIL],
  clinicScheduleMap[ClinicScheduleTypeEnum.ONLINE],
  clinicScheduleMap[ClinicScheduleTypeEnum.ASK],
  clinicScheduleMap[ClinicScheduleTypeEnum.NONE],
];
