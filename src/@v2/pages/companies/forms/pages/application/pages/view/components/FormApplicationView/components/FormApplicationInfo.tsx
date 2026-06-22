import { SIconEdit } from '@v2/assets/icons/SIconEdit/SIconEdit';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { InfoCardAvatar } from '@v2/components/organisms/SInfoCard/components/InfoCardAvatar/InfoCardAvatar';
import { InfoCardSection } from '@v2/components/organisms/SInfoCard/components/InfoCardSection/InfoCardSection';
import { InfoCardExpandableText } from '@v2/components/organisms/SInfoCard/components/InfoCardText/InfoCardExpandableText';
import { InfoCardText } from '@v2/components/organisms/SInfoCard/components/InfoCardText/InfoCardText';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import SIconDocument from 'assets/icons/SDocumentIcon';
import { FormApplicationScopeTypeEnum } from '@v2/models/form/enums/form-application-scope-type.enum';

export const FormApplicationInfo = ({
  mb,
  formApplication,
  onEdit,
}: {
  mb: number[];
  formApplication: FormApplicationReadModel | null | undefined;
  onEdit: () => void;
}) => {
  if (!formApplication) {
    return <SSkeleton height={200} sx={{ mb: 10 }} />;
  }

  const hasParticipantScope =
    formApplication.participants.hierarchies.length > 0 ||
    formApplication.participants.workspaces.length > 0 ||
    formApplication.participants.companies.length > 0;

  return (
    <SPaper mb={mb}>
      <SAccordion
        defaultExpanded={false}
        icon={<InfoCardAvatar icon={<SIconDocument />} />}
        title={formApplication.name}
        subtitle={formApplication.form.name}
        fontWeight="600"
        accordionProps={{
          sx: {
            boxShadow: 'none',
            '&::before': { display: 'none' },
          },
        }}
        endComponent={
          <SIconButton
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <SIconEdit fontSize={22} color="grey.600" />
          </SIconButton>
        }
      >
        <SAccordionBody>
          <InfoCardSection numColumns={2}>
            <InfoCardText label="Formulário" text={formApplication.form.name} />
            <InfoCardText
              label="Data de Criação"
              text={formApplication.formatCreatedAt}
            />
          </InfoCardSection>
          {(formApplication.formatStartedAt || formApplication.formatEndedAt) && (
            <>
              <SDivider />
              <InfoCardSection numColumns={2}>
                {formApplication.formatStartedAt && (
                  <InfoCardText
                    label="Data de Início"
                    text={formApplication.formatStartedAt}
                  />
                )}
                {formApplication.formatEndedAt && (
                  <InfoCardText
                    label="Data de Término"
                    text={formApplication.formatEndedAt}
                  />
                )}
              </InfoCardSection>
            </>
          )}
          {hasParticipantScope && (
            <>
              <SDivider />
              <InfoCardSection>
                {formApplication.participants.hierarchies.length > 0 && (
                  <InfoCardText
                    label="Hierarquias Participantes"
                    text={formApplication.participants.hierarchies
                      .map((h) => h.name)
                      .join(', ')}
                  />
                )}
                {formApplication.scopeType ===
                  FormApplicationScopeTypeEnum.BUSINESS_GROUP_COMPANIES &&
                  formApplication.participants.companies.length > 0 && (
                    <InfoCardText
                      label="Empresas participantes"
                      text={formApplication.participants.companies
                        .map((company) => company.name)
                        .join(', ')}
                    />
                  )}
                {formApplication.scopeType ===
                  FormApplicationScopeTypeEnum.COMPANY_WORKSPACES &&
                  formApplication.participants.companies.length > 0 && (
                    <InfoCardText
                      label="Empresas participantes (convertidas)"
                      text={formApplication.participants.companies
                        .map((company) => company.name)
                        .join(', ')}
                    />
                  )}
                {formApplication.scopeType ===
                  FormApplicationScopeTypeEnum.COMPANY_WORKSPACES &&
                  formApplication.participants.workspaces.length > 0 && (
                    <InfoCardExpandableText
                      label="Estabelecimentos participantes"
                      text={formApplication.participants.workspaces
                        .map((w) => w.name)
                        .join(', ')}
                    />
                  )}
              </InfoCardSection>
            </>
          )}
          {formApplication.description && (
            <>
              <SDivider />
              <InfoCardSection>
                <InfoCardText
                  label="Descrição"
                  text={formApplication.description}
                />
              </InfoCardSection>
            </>
          )}
        </SAccordionBody>
      </SAccordion>
    </SPaper>
  );
};
