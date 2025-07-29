import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { FormFormApplication } from '../../../components/FormFormApplication';

type Props = {
  companyId: string;
  mb?: number;
};

export const FormAddFormApplication = ({ companyId, mb = 0 }: Props) => {
  return (
    <SFormSection mb={mb}>
      <FormFormApplication companyId={companyId} />
    </SFormSection>
  );
};
