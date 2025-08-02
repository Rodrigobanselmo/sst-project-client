import { SIconEdit } from '@v2/assets/icons/SIconEdit/SIconEdit';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { InfoCardAvatar } from '@v2/components/organisms/SInfoCard/components/InfoCardAvatar/InfoCardAvatar';
import { InfoCardSection } from '@v2/components/organisms/SInfoCard/components/InfoCardSection/InfoCardSection';
import { InfoCardText } from '@v2/components/organisms/SInfoCard/components/InfoCardText/InfoCardText';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { PageRoutes } from '@v2/constants/pages/routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import SIconDocument from 'assets/icons/SDocumentIcon';
import SIconLink from 'assets/icons/SLinkIcon';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { getPathname } from '@v2/hooks/useAppRouter';

export const FormApplicationInfo = ({
  mb,
  formApplication,
  onEdit,
}: {
  mb: number[];
  formApplication: FormApplicationReadModel | null | undefined;
  onEdit: () => void;
}) => {
  const { showSnackBar } = useSystemSnackbar();

  const handleCopyPublicUrl = () => {
    if (!formApplication) return;

    const publicUrl = getPathname(PageRoutes.FORMS.PUBLIC_FORM_ANSWER.PATH, {
      pathParams: { id: formApplication.id },
    });

    const fullUrl = `${window.location.origin}${publicUrl}`;

    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        showSnackBar(
          'Link do formulário copiado para a área de transferência!',
          {
            type: 'success',
          },
        );
      })
      .catch(() => {
        showSnackBar('Erro ao copiar o link. Tente novamente.', {
          type: 'error',
        });
      });
  };

  if (!formApplication) {
    return <SSkeleton height={200} sx={{ mb: 10 }} />;
  }

  return (
    <>
      <SPaper mb={mb}>
        <InfoCardSection gridColumns={'1fr'}>
          <SFlex justifyContent="space-between">
            <SFlex gap={6}>
              <InfoCardAvatar icon={<SIconDocument />} />
              <InfoCardText
                schema="normal"
                label="Nome da Aplicação"
                text={formApplication.name}
              />
            </SFlex>
            <SFlex gap={1} alignItems="center">
              {formApplication.isShareableLink && (
                <SButton
                  text="Link Público"
                  icon={<SIconLink sx={{ fontSize: 16 }} />}
                  onClick={handleCopyPublicUrl}
                  size="s"
                  variant="outlined"
                  color="info"
                />
              )}
              <SIconButton onClick={onEdit}>
                <SIconEdit fontSize={22} color="grey.600" />
              </SIconButton>
            </SFlex>
          </SFlex>
        </InfoCardSection>
        <SDivider />
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
        {(formApplication.participants.hierarchies.length > 0 ||
          formApplication.participants.workspaces.length > 0) && (
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
              {formApplication.participants.workspaces.length > 0 && (
                <InfoCardText
                  label="Estabelecimentos Participantes"
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
      </SPaper>
    </>
  );
};
