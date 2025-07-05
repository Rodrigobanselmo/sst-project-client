import AddIcon from '@mui/icons-material/Add';
import { Box, Divider, IconButton, InputAdornment, Stack } from '@mui/material';
import { SIconDelete } from '@v2/assets/icons';
import { SIconCopy } from '@v2/assets/icons/SIconCopy/SIconCopy';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SEditorForm } from '@v2/components/forms/controlled/SEditorForm/SEditorForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SSwitchForm } from '@v2/components/forms/controlled/SSwitchForm/SSwitchForm';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { FormQuestionTypeMapList } from '../../maps/form-question-type-map';
import { getFormModelInitialValues } from '../FormModelAddContent/FormModelAddContent.schema';

export const FormModelGroup = ({ companyId }: { companyId: string }) => {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Gather all type values for the items
  const typeValues =
    useWatch({ name: 'items', control })?.map((item: any) => item?.type) || [];

  const handleAdd = () => {
    append(getFormModelInitialValues());
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <IconButton onClick={handleAdd} color="primary">
          <AddIcon />
        </IconButton>
      </Stack>
      <Stack gap={8}>
        {fields.map((field, idx) => {
          return (
            <SAccordion
              key={field.id}
              expandIcon={null}
              expanded={true}
              onChange={() => {}}
              endComponent={
                <SSearchSelectForm
                  boxProps={{
                    sx: {
                      ml: 'auto',
                    },
                  }}
                  name={`items.${idx}.type`}
                  renderStartAdornment={({ option }) =>
                    option ? (
                      <InputAdornment position="start">
                        {option?.icon}
                      </InputAdornment>
                    ) : null
                  }
                  placeholder="Tipo"
                  renderItem={(option) => (
                    <SFlex alignItems="center" gap={2}>
                      {option.option.icon}
                      <span>{option.label}</span>
                    </SFlex>
                  )}
                  options={FormQuestionTypeMapList}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                />
              }
              title={`Pergunta ${idx + 1}`}
            >
              <SAccordionBody>
                <SFlex mt={8} flexDirection="column" gap={5}>
                  <SEditorForm
                    name={`items.${idx}.content`}
                    editorContainerProps={{
                      sx: {},
                    }}
                  />
                  <Divider sx={{ mt: 4, mb: 2 }} />
                  <SFlex alignItems="center" justifyContent="flex-end" gap={2}>
                    <SIconButton>
                      <SIconCopy color="grey.600" fontSize={20} />
                    </SIconButton>
                    <SIconButton>
                      <SIconDelete color="grey.600" fontSize={22} />
                    </SIconButton>
                    <SDivider
                      orientation="vertical"
                      sx={{ mx: 4, ml: 2, height: 28 }}
                    />

                    <SSwitchForm
                      name={`items.${idx}.required`}
                      label="Obrigatória"
                      fontSize="14px"
                    />
                  </SFlex>
                </SFlex>
              </SAccordionBody>
            </SAccordion>
          );
        })}
      </Stack>
    </Box>
  );
};
