import { SIconEdit } from '@v2/assets/icons/SIconEdit/SIconEdit';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { InfoCardAvatar } from '@v2/components/organisms/SInfoCard/components/InfoCardAvatar/InfoCardAvatar';
import { InfoCardSection } from '@v2/components/organisms/SInfoCard/components/InfoCardSection/InfoCardSection';
import { InfoCardText } from '@v2/components/organisms/SInfoCard/components/InfoCardText/InfoCardText';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import SIconDocument from 'assets/icons/SDocumentIcon';

export const FormApplicationInfo = ({
  mb,
  formApplication,
  isLoading,
  onEdit,
}: {
  mb: number[];
  formApplication: FormApplicationReadModel | null | undefined;
  isLoading: boolean;
  onEdit: () => void;
}) => {
  if (isLoading || !formApplication) {
    return <SSkeleton height={200} sx={{ mb: 10 }} />;
  }

  return (
    <>
      <SPaper mb={mb}>
        <InfoCardSection gridColumns={'1fr 40px'}>
          <SFlex gap={6}>
            <InfoCardAvatar icon={<SIconDocument />} />
            <InfoCardText
              schema="normal"
              label="Nome da Aplicação"
              text={formApplication.name}
            />
          </SFlex>
          <SIconButton onClick={onEdit}>
            <SIconEdit fontSize={22} color="grey.600" />
          </SIconButton>
        </InfoCardSection>
        <SDivider />
        <InfoCardSection numColumns={4}>
          <InfoCardText
            label="Data de Criação"
            text={formApplication.formatCreatedAt}
          />
          <InfoCardText
            label="Última Atualização"
            text={formApplication.formatUpdatedAt}
          />
        </InfoCardSection>
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
      </SPaper>
    </>
  );
};
