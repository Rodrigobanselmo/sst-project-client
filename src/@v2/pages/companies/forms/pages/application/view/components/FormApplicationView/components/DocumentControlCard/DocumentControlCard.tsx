import { SIconDownload } from '@v2/assets/icons/SIconDownload/SIconDownload';
import { SIconEdit } from '@v2/assets/icons/SIconEdit/SIconEdit';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { DocumentControlReadModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-read.model';
import { InfoCardSection } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/components/InfoCardSection';
import { InfoCardText } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/components/InfoCardText';
import { donwloadPublicUrl } from '@v2/utils/download-public-url';

export const DocumentControlCard = ({
  documentControl,
  onEdit,
}: {
  documentControl: DocumentControlReadModel;
  onEdit: () => void;
}) => {
  function handleDownload(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (documentControl?.url) donwloadPublicUrl(documentControl.url);
  }

  return (
    <SPaper maxWidth={800}>
      <InfoCardSection gridColumns={'1fr 1fr 40px'}>
        <InfoCardText label="Nome" text={documentControl.name} />
        <InfoCardText label="Tipo" text={documentControl.type} />
        <SIconButton onClick={onEdit}>
          <SIconEdit fontSize={22} color="grey.600" />
        </SIconButton>
      </InfoCardSection>
      <SDivider />
      <InfoCardSection gridColumns={'1fr 100px'}>
        <InfoCardText
          label="Descrição"
          text={documentControl.description || '-'}
        />
        <SButton
          text="Baixar"
          size="s"
          color="primary"
          variant="shade"
          onClick={handleDownload}
          icon={<SIconDownload />}
        />
      </InfoCardSection>
    </SPaper>
  );
};
