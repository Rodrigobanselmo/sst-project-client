/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Tab, Tabs } from '@mui/material';
import { CompanyAiBudget } from '@v2/features/ai-accounting/CompanyAiBudget';
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

function CompanyAiManagement({
  company,
  onClose,
  registerCloseGuard,
}: {
  company: { id: string; name: string };
  onClose: () => void;
  registerCloseGuard: (guard: () => boolean) => () => void;
}) {
  const [section, setSection] = useState(0);
  const guard = useRef<(() => boolean) | null>(null);
  const registerGuard = useCallback(
    (next: () => boolean) => {
      guard.current = next;
      const unregister = registerCloseGuard(next);
      return () => {
        guard.current = null;
        unregister();
      };
    },
    [registerCloseGuard],
  );

  return (
    <>
      <Tabs
        value={section}
        onChange={(_, next: number) => {
          if (!guard.current || guard.current()) setSection(next);
        }}
        aria-label="Gestão de IA"
      >
        <Tab label="Uso e limites" />
        <Tab label="Ilustrações com IA" />
      </Tabs>
      <Box
        sx={(theme) => ({
          pt: 8,
          ...(theme.palette.mode === 'dark' && {
            color: theme.palette.common.white,
            '& .MuiTypography-root:not(.MuiLink-root, .MuiAlert-root *), & .MuiFormControlLabel-label:not(.Mui-disabled), & .MuiFormHelperText-root:not(.Mui-error, .Mui-disabled)':
              { color: theme.palette.common.white },
          }),
        })}
      >
        {section === 0 ? (
          <CompanyAiBudget
            companyId={company.id}
            registerCloseGuard={registerGuard}
          />
        ) : (
          <IllustrationAdministrationModal
            embedded
            company={company}
            onClose={onClose}
            registerCloseGuard={registerGuard}
          />
        )}
      </Box>
    </>
  );
}

export const ModalEditCompany = () => {
  const theme = useTheme();
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
        sx={{
          ...(isEdit && {
            width: { xs: '95vw', lg: 'min(1280px,95vw)' },
            minWidth: 0,
            maxWidth: '95vw',
            maxHeight: '90vh',
            overflowY: 'auto',
          }),
          ...(theme.palette.mode === 'dark' && {
            '& .MuiFormHelperText-root:not(.Mui-error), & .MuiFormLabel-root:not(.Mui-focused):not(.Mui-error)':
              {
                color: theme.palette.text.secondary,
              },
            '& img[src="/images/placeholder-image.png"]': {
              filter: 'invert(1)',
            },
          }),
        }}
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
                  ...(showIllustrations ? [{ label: 'Gestão de IA' }] : []),
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
            <CompanyAiManagement
              key={props.companyData.id}
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
