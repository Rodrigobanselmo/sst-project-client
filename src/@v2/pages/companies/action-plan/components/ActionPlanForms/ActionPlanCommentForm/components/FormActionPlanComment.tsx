import { Box } from '@mui/material';
import { SFormRow } from '@v2/components/forms/components/SFormRow/SFormRow';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { CommnetTextTypeMapList } from '../maps/comment-text-type-map';

export const FormActionPlanComment = () => {
  return (
    <Box>
      <SFormSection>
        <SFormRow>
          <SSearchSelectForm
            boxProps={{ flex: 1 }}
            label="Motivo"
            name="textType"
            options={CommnetTextTypeMapList}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
          />
          <SInputMultilineForm
            label="Descreva o que aconteceu "
            name="text"
            fullWidth
          />
        </SFormRow>
      </SFormSection>
    </Box>
  );
};
