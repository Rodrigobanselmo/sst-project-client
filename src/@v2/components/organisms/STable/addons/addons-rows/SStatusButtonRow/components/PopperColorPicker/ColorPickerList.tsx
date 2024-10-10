import styled from '@emotion/styled';
import { Box } from '@mui/material';

// Styled components for the color picker
const ColorPickerWrapper = styled(Box)`
  position: relative;
  display: inline-block;
`;

const ColorGrid = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  border-radius: 8px;
  gap: 10px;
  background: white;
`;

const colors = [
  '#800000',
  '#E50000',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#1bb742',
  '#8BC34A',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#af7e2e',
  '#795548',
  '#9E9E9E',
  '#607D8B',
  'transparent',
];

export const ColorPickerList = ({
  selectedColor,
  onSelectedColor,
}: {
  onSelectedColor: (color: string | null) => void;
  selectedColor?: string;
}) => {
  const handleColorClick = (color: string) => {
    const isEmpty = 'transparent' === color;
    if (isEmpty) return onSelectedColor(null);
    return onSelectedColor(color);
  };

  return (
    <ColorPickerWrapper>
      <ColorGrid>
        {colors.map((color, index) => {
          const isEmpty = 'transparent' === color;
          const isSelected = selectedColor === color;

          return (
            <Box
              key={index}
              color={color}
              onClick={() => handleColorClick(color)}
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: color,
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  ':after': {
                    content: '""',
                    width: 'calc(100% + 4px)',
                    height: 'calc(100% + 4px)',
                    borderRadius: '50%',
                    border: '1px solid',
                    position: 'absolute',
                    borderColor: 'grey.400',
                    margin: '-3px',
                  },
                },
                ...(isSelected && {
                  ':after': {
                    content: '""',
                    width: 'calc(100% + 4px)',
                    height: 'calc(100% + 4px)',
                    borderRadius: '50%',
                    border: '1px solid',
                    position: 'absolute',
                    borderColor: 'grey.400',
                    margin: '-3px',
                  },
                }),
                ...(isEmpty && {
                  border: '1px solid',
                  borderColor: 'grey.400',
                  ':before': {
                    content: '""',
                    display: 'block',
                    width: '1px',
                    backgroundColor: 'grey.400',
                    height: '100%',
                    position: 'absolute',
                    left: '50%',
                    transform: 'rotate(45deg)',
                  },
                }),
              }}
            />
          );
        })}
      </ColorGrid>
    </ColorPickerWrapper>
  );
};
