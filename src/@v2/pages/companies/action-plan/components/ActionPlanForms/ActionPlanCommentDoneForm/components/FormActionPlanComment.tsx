import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';

export const FormActionPlanCommentDone = () => {
  return (
    <SFormSection>
      <SInputMultilineForm
        label="Descreva o que foi feito"
        labelShrink="Descrescrição"
        placeholder="descreva o que foi feito"
        name="text"
        fullWidth
      />
    </SFormSection>
  );
};
