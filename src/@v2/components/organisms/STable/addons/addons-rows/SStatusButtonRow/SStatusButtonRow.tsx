import { Button, Input } from '@mui/material';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { useSearch } from '@v2/hooks/useSearch';
import { contrastColor } from 'contrast-color';
import { useRef } from 'react';
import { SEditButtonRow } from '../SEditButtonRow/SEditButtonRow';
import {
  PopperStatusCreator,
  PopperStatusCreatorProps,
} from './components/PopperStatusCreator/PopperStatusCreator';
import STooltip from '@v2/components/atoms/STooltip/STooltip';

export interface SStatusButtonRowProps
  extends Pick<
    PopperStatusCreatorProps,
    'onDelete' | 'onEdit' | 'onAdd' | 'options' | 'isLoading'
  > {
  label: string;
  onSelect: (id: number | null) => void;
}

export function SStatusButtonRow({
  options,
  label,
  onAdd,
  onDelete,
  onEdit,
  onSelect,
  isLoading,
}: SStatusButtonRowProps) {
  const selectSate = useDisclosure();
  const editState = useDisclosure();

  const { results, onSearch } = useSearch({
    data: options,
    keys: ['name'],
    threshold: 0,
  });

  const anchorEl = useRef<null | HTMLDivElement>(null);

  return (
    <>
      <SEditButtonRow
        onClick={selectSate.toggle}
        anchorEl={anchorEl}
        label={label}
      />
      {!editState.isOpen && (
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
              mt={4}
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
                      title={item.name}
                      placement="left-start"
                    >
                      <SFlex
                        center
                        onClick={() => onSelect(item.id)}
                        sx={{
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'grey.300',
                          color: isEmpty ? 'text.light' : 'white',
                          backgroundColor: item.color,
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
                            color: contrastColor({
                              bgColor: item.color || 'white',
                            }),
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
            <Button
              disableRipple
              onClick={editState.toggle}
              sx={{
                fontSize: '11px',
                textDecoration: 'underline dotted',
                color: 'text.light',
                padding: '8px 12px',
                fontWeight: 400,
                textTransform: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: 'primary.main',
                  backgroundColor: 'transparent',
                },
                '&:active': {
                  textDecoration: 'underline',
                  color: 'primary.dark',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Adicionar/editar
            </Button>
          </SFlex>
        </SPopperArrow>
      )}
      {editState.isOpen && (
        <PopperStatusCreator
          anchorEl={anchorEl}
          isLoading={isLoading}
          isOpen={editState.isOpen}
          close={editState.close}
          onAdd={onAdd}
          onDelete={onDelete}
          onEdit={onEdit}
          options={options}
        />
      )}
    </>
  );
}
