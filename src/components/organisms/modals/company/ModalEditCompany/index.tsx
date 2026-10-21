/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useRef } from 'react';
import { useAccess } from 'core/hooks/useAccess';
import { IllustrationAdministrationModal } from '../IllustrationAdministration/IllustrationAdministrationModal';

import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { Wizard } from 'components/organisms/main/Wizard';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';

import { ModalEnum } from 'core/enums/modal.enums';
import { addressSchema } from 'core/utils/schemas/address.schema';
import { companySchema } from 'core/utils/schemas/company.schema';

import { ZeroModalCompanyStep } from './components/0-cnpj';
import { FirstModalCompanyStep } from './components/1-data';
import { SecondModalCompanyStep } from './components/2-address';
import { SSTModalCompanyStep } from './components/3-sst/SstStep';
import { FourthModalCompanyStep } from './components/4-logo';
import { DocumentModalCompanyStep } from './components/5-documents';
import { ContactModalCompanyStep } from './components/6-contacts';
import { CoverModalCompanyStep } from './components/7-cover';
import { JourneysModalCompanyStep } from './components/8-journeys';
import { useEditCompany } from './hooks/useEditCompany';

export const ModalEditCompany = () => {
  const props = useEditCompany();
  const isEdit = props.isEdit;
  const { isMaster } = useAccess();
  const showIllustrations = !!(isEdit && props.companyData.id && isMaster);
  const illustrationCloseGuard = useRef<(() => boolean) | null>(null);
  const registerCloseGuard = useCallback((guard: () => boolean) => {
    illustrationCloseGuard.current = guard;
    return () => {
      if (illustrationCloseGuard.current === guard)
        illustrationCloseGuard.current = null;
    };
  }, []);
  const closeCompany = () => {
    if (!illustrationCloseGuard.current || illustrationCloseGuard.current())
      props.onCloseUnsaved();
  };
  return (
    <SModal
      {...props.registerModal(ModalEnum.COMPANY_EDIT)}
      keepMounted={false}
      onClose={closeCompany}
    >
      <SModalPaper
        sx={
          isEdit
            ? {
                width: { xs: '95vw', lg: 'min(1280px,95vw)' },
                minWidth: 0,
                maxWidth: '95vw',
                maxHeight: '90vh',
                overflowY: 'auto',
              }
            : undefined
        }
        p={8}
        center
      >
        <SModalHeader
          tag={props.companyData.id ? 'edit' : 'add'}
          onClose={closeCompany}
          title={'Empresa'}
          {...(props.companyData.id && {
            onDelete: props.onDelete,
          })}
        />

        <Wizard
          header={
            isEdit ? (
              <WizardTabs
                onChangeTab={(value, goToStep) => {
                  if (
                    !illustrationCloseGuard.current ||
                    illustrationCloseGuard.current()
                  )
                    goToStep(value);
                }}
                options={[
                  { label: 'Dados da empresa' },
                  { label: 'Endereço' },
                  { label: 'SST' },
                  { label: 'Informações Adcionais' },
                  // { label: 'Documentos' },
                  { label: 'Contato' },
                  { label: 'Capa do Documento' },
                  { label: 'Jornadas de trabalho' },
                  ...(showIllustrations
                    ? [{ label: 'Ilustrações com IA' }]
                    : []),
                ]}
              />
            ) : null
          }
          schemas={[companySchema, addressSchema]}
        >
          {!isEdit && <ZeroModalCompanyStep {...props} />}
          <FirstModalCompanyStep {...props} />
          <SecondModalCompanyStep {...props} />
          <SSTModalCompanyStep {...props} />
          <FourthModalCompanyStep {...props} />
          {/* <DocumentModalCompanyStep {...props} /> */}
          <ContactModalCompanyStep {...props} />
          <CoverModalCompanyStep {...props} />
          {isEdit && <JourneysModalCompanyStep {...props} />}
          {showIllustrations && (
            <IllustrationAdministrationModal
              embedded
              company={{
                id: props.companyData.id,
                name: props.companyData.name,
              }}
              onClose={props.onCloseUnsaved}
              registerCloseGuard={registerCloseGuard}
            />
          )}
        </Wizard>
      </SModalPaper>
    </SModal>
  );
};
