import { Divider, InputAdornment } from '@mui/material';
import { SIconDelete, SIconUnfolderMore } from '@v2/assets/icons';
import { SIconCopy } from '@v2/assets/icons/SIconCopy/SIconCopy';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SEditorForm } from '@v2/components/forms/controlled/SEditorForm/SEditorForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SSwitchForm } from '@v2/components/forms/controlled/SSwitchForm/SSwitchForm';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface FormQuestionOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface SFormQuestionAccordionProps {
  sectionIndex: number;
  questionIndex: number;
  questionNumber: number;
  typeOptions: FormQuestionOption[];
  isFocused?: boolean;
  onCopy?: () => void;
  onDelete?: () => void;
  onAddNewSection: () => void;
  onAddNewQuestion: () => void;
}

export const SFormQuestionAccordion = ({
  sectionIndex,
  questionIndex,
  questionNumber,
  typeOptions,
  isFocused = false,
  onCopy,
  onDelete,
  onAddNewSection,
  onAddNewQuestion,
}: SFormQuestionAccordionProps) => {
  return (
    <div style={{ position: 'relative' }}>
      <SAccordion
        expandIcon={null}
        expanded={true}
        onChange={() => {}}
        accordionProps={{
          sx: {
            borderLeft: isFocused ? '5px solid' : 'none',
            borderColor: isFocused ? 'info.light' : 'transparent',
          },
        }}
        endComponent={
          <SSearchSelectForm
            boxProps={{
              sx: {
                ml: 'auto',
              },
            }}
            name={`sections.${sectionIndex}.items.${questionIndex}.type`}
            renderStartAdornment={({ option }) =>
              option ? (
                <InputAdornment position="start">{option?.icon}</InputAdornment>
              ) : null
            }
            placeholder="Tipo"
            renderItem={(option) => (
              <SFlex alignItems="center" gap={2}>
                {option.option.icon}
                <span>{option.label}</span>
              </SFlex>
            )}
            options={typeOptions}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
          />
        }
        title={`Pergunta ${questionNumber}`}
      >
        <SAccordionBody>
          <SFlex mt={8} flexDirection="column" gap={5}>
            <SEditorForm
              name={`sections.${sectionIndex}.items.${questionIndex}.content`}
              editorContainerProps={{
                sx: {},
              }}
            />
            <Divider sx={{ mt: 4, mb: 2 }} />
            <SFlex alignItems="center" justifyContent="flex-end" gap={2}>
              <SIconButton onClick={onCopy}>
                <SIconCopy color="grey.600" fontSize={20} />
              </SIconButton>
              <SIconButton onClick={onDelete}>
                <SIconDelete color="grey.600" fontSize={22} />
              </SIconButton>
              <SDivider
                orientation="vertical"
                sx={{ mx: 4, ml: 2, height: 28 }}
              />

              <SSwitchForm
                name={`sections.${sectionIndex}.items.${questionIndex}.required`}
                label="Obrigatória"
                fontSize="14px"
              />
            </SFlex>

            {/* Action Bar */}
            <Divider sx={{ mt: 4, mb: 2 }} />
          </SFlex>
        </SAccordionBody>
      </SAccordion>
      {isFocused && (
        <SFlex
          direction="column"
          alignItems="center"
          justifyContent="flex-end"
          position="absolute"
          right={-54}
          top={-10}
          gap={0}
          bgcolor="background.paper"
          px={1}
          py={2}
          borderRadius={1}
          border="1px solid"
          borderColor="divider"
          mt={4}
          mb={5}
        >
          <SIconButton
            tooltip="Adicionar pergunta"
            tooltipProps={{
              placement: 'right',
            }}
          >
            <AddCircleOutlineIcon onClick={onAddNewQuestion} />
          </SIconButton>
          <SIconButton
            tooltip="Adicionar seção"
            tooltipProps={{
              placement: 'right',
            }}
          >
            <SFlex
              alignItems="center"
              justifyContent="center"
              direction="column"
              onClick={onAddNewSection}
              gap={1}
            >
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: 20,
                    height: 7,
                    border: '2px solid',
                    color: 'text.main',
                  }}
                />
              ))}
            </SFlex>
          </SIconButton>
        </SFlex>
      )}
    </div>
  );
};
