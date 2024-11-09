import { Box, Input } from '@mui/material';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { useSearch } from '@v2/hooks/useSearch';
import { contrastColor } from 'contrast-color';
import { useRef } from 'react';
import { SEditButtonRow } from '../SEditButtonRow/SEditButtonRow';

export interface SUserButtonRowProps {
  options: { name: string; id: number }[];
  label: string;
  onSelect: (id: number | null) => void;
}

export function SUserButtonRow({
  options,
  label,
  onSelect,
}: SUserButtonRowProps) {
  const selectSate = useDisclosure();

  const { results, onSearch } = useSearch({
    data: options,
    keys: ['name'],
    threshold: 0,
  });

  const anchorEl = useRef<null | HTMLDivElement>(null);

  const handleSelect = (id: number | null) => {
    onSelect(id);
    selectSate.close();
  };

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <STooltip title={label} placement="left" withWrapper minLength={15}>
        <SEditButtonRow
          onClick={(e) => {
            e.stopPropagation();
            selectSate.toggle();
          }}
          anchorEl={anchorEl}
          label={label}
          textProps={{
            sx: {
              filter: 'brightness(0.5)',
            },
          }}
          boxProps={{
            width: '100%',
          }}
        />
      </STooltip>
      <SPopperArrow
        disabledArrow
        placement="bottom-start"
        anchorEl={anchorEl}
        isOpen={selectSate.isOpen}
        close={selectSate.close}
        color="paper"
      >
        <SFlex direction="column" width={200} gap={0}>
          <SText
            sx={{
              alignItems: 'center',
              color: 'text.light',
              display: 'flex',
              fontSize: '11px',
              height: '26px',
              fontWeight: 500,
              lineHeight: '11px',
              padding: '0px 12px',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            SELECIONE UMA OPÇÃO
          </SText>
          <Input
            autoFocus
            disableUnderline
            fullWidth
            onChange={(e) => onSearch(e.target.value)}
            placeholder="procurar ou adicionar"
            sx={{
              border: 'none',
              outline: 'none',
              display: 'inline-block',
              fontSize: '11px',
              lineHeight: '11px',
              padding: '0px 22px 0px 12px',
              marginBottom: '4px',
            }}
          />
          <SDivider />
          <SFlex
            my={4}
            px={4}
            direction="column"
            maxHeight={210}
            overflow="auto"
          >
            {[{ name: '-', id: null, color: undefined }, ...results].map(
              (item) => {
                const isEmpty = item.id === null;
                return (
                  <STooltip
                    key={item.id}
                    title={isEmpty ? '' : item.name}
                    placement="left-start"
                  >
                    <SFlex
                      center
                      onClick={() => handleSelect(item.id)}
                      sx={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'grey.300',
                        color: isEmpty ? 'text.light' : 'white',
                        backgroundColor: 'grey.100',
                        padding: '4px 8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        width: '100%',
                        position: 'relative',
                        cursor: 'pointer',
                        '&:hover': {
                          filter: 'brightness(0.95)',
                        },
                        '&:active': {
                          filter: 'brightness(0.9)',
                        },
                      }}
                    >
                      <SText
                        lineNumber={1}
                        textAlign={'center'}
                        sx={{
                          color: contrastColor({ bgColor: 'white' }),
                          fontSize: '13px',
                          fontWeight: 400,
                        }}
                      >
                        {item.name}
                      </SText>
                    </SFlex>
                  </STooltip>
                );
              },
            )}
          </SFlex>
        </SFlex>
      </SPopperArrow>
    </Box>
  );
}
