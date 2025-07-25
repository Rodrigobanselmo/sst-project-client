import { Box, Stack } from '@mui/material';
import { SIconDelete } from '@v2/assets/icons';
import { SIconAdd } from '@v2/assets/icons/SIconAdd/SIconAdd';
import { SIconUnfolderMore } from '@v2/assets/icons/SIconUnfolderMore/SIconUnfolderMore';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SEditorForm } from '@v2/components/forms/controlled/SEditorForm/SEditorForm';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { SPopperMenu } from '@v2/components/organisms/SPopper/addons/SPopperMenu/SPopperMenu';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';
import { SMoreOptionsIcon } from 'assets/icons/SMoreOptionsIcon/SMoreOptionsIcon';
import { useRef, useState } from 'react';

interface SFormSectionProps {
  sectionIndex: number;
  sectionNumber: number;
  children: React.ReactNode;
  onDeleteSection?: () => void;
  onAddNewQuestion?: () => void;
  onMinimizeSection?: () => void;
  isMinimized?: boolean;
}

export const SFormSectionHeader = ({
  sectionIndex,
  sectionNumber,
  onDeleteSection,
  onAddNewQuestion,
  onMinimizeSection,
  isMinimized = false,
  children,
}: SFormSectionProps) => {
  const [isPopperOpen, setIsPopperOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleTogglePopper = () => {
    setIsPopperOpen(!isPopperOpen);
  };

  const handleClosePopper = () => {
    setIsPopperOpen(false);
  };

  const handleDeleteSection = () => {
    onDeleteSection?.();
    handleClosePopper();
  };

  const handleMinimizeSection = () => {
    onMinimizeSection?.();
    handleClosePopper();
  };

  return (
    <Stack gap={4}>
      {/* Section Header */}
      <SAccordion
        accordionProps={{
          sx: {
            borderTop: '7px solid',
            borderColor: 'grey.500',
          },
        }}
        title={`Seção ${sectionNumber}`}
        expandIcon={null}
        expanded={true}
        onChange={() => {}}
        endComponent={
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}
          >
            <SIconButton
              iconButtonProps={{ ref: anchorRef }}
              onClick={handleTogglePopper}
            >
              <SMoreOptionsIcon sx={{ color: 'grey.600', fontSize: 20 }} />
            </SIconButton>
          </Box>
        }
      >
        <SAccordionBody>
          <Stack gap={4} my={8}>
            <SInputForm
              placeholder="Título da seção"
              name={`sections.${sectionIndex}.title`}
            />
            {isMinimized ? null : (
              <SEditorForm
                name={`sections.${sectionIndex}.description`}
                editorContainerProps={{
                  sx: {},
                }}
              />
            )}
          </Stack>
        </SAccordionBody>
      </SAccordion>

      {/* Questions */}
      {isMinimized ? null : children}

      {/* Popper Menu */}
      <SPopperArrow
        isOpen={isPopperOpen}
        close={handleClosePopper}
        anchorEl={anchorRef}
        placement="bottom-end"
      >
        <SPopperMenu>
          <SPopperMenuItem
            text="Adicionar pergunta"
            onClick={onAddNewQuestion}
            icon={({ color }) => <SIconAdd color={color} fontSize={16} />}
          />
          <SPopperMenuItem
            text={isMinimized ? 'Expandir seção' : 'Minimizar seção'}
            onClick={handleMinimizeSection}
            icon={({ color }) => (
              <SIconUnfolderMore color={color} fontSize={16} />
            )}
          />
          <SPopperMenuItem
            text="Excluir seção"
            onClick={handleDeleteSection}
            icon={({ color }) => <SIconDelete color={color} fontSize={16} />}
          />
        </SPopperMenu>
      </SPopperArrow>
    </Stack>
  );
};
