import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';

interface SFormQuestionAccordionButtonsProps {
  onAddNewSection: () => void;
  onAddNewQuestion: () => void;
}

export const SFormQuestionAccordionButtons = ({
  onAddNewSection,
  onAddNewQuestion,
}: SFormQuestionAccordionButtonsProps) => {
  return (
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
        onClick={onAddNewQuestion}
        tooltipProps={{
          placement: 'right',
        }}
      >
        <AddCircleOutlineIcon />
      </SIconButton>
      <SIconButton
        tooltip="Adicionar seção"
        onClick={onAddNewSection}
        tooltipProps={{
          placement: 'right',
        }}
      >
        <SFlex
          alignItems="center"
          justifyContent="center"
          direction="column"
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
  );
};
