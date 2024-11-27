import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { Box, CircularProgress, Input } from '@mui/material';
import { SIconAdd } from '@v2/assets/icons/SIconAdd/SIconAdd';
import { SIconDelete } from '@v2/assets/icons/SIconDelete/SIconDelete';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { MutableRefObject, useRef, useState, useTransition } from 'react';
import { PopperColorPicker } from '../PopperColorPicker/PopperColorPicker';
import { simulateAwait } from 'core/utils/helpers/simulateAwait';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

export interface PopperStatusOptionProps {
  color?: string | null;
  name: string;
  id: number;
}

export interface PopperStatusCreatorProps {
  options: PopperStatusOptionProps[];
  isLoading?: boolean;
  isOpen: boolean;
  close: () => void;
  anchorEl: MutableRefObject<HTMLDivElement | HTMLButtonElement | null>;

  onEdit: (params: {
    value?: string;
    id: number;
    color?: string | null;
  }) => Promise<void>;
  onAdd: (params: { value: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function PopperStatusCreator({
  options,
  close,
  isLoading,
  anchorEl,
  isOpen,
  onEdit,
  onAdd,
  onDelete,
}: PopperStatusCreatorProps) {
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingIdDelete, setLoadingIdDelete] = useState<false | number>(false);
  const [loadingIdEdit, setLoadingIdEdit] = useState<false | number>(false);

  const [adding, setAdding] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async (value: string) => {
    if (value) {
      setLoadingAdd(true);
      setAdding(true);

      await onAdd({ value }).finally(() => {
        setAdding(false);
        setLoadingAdd(false);
      });
    } else {
      setAdding(false);
    }
  };

  const handleEdit = async ({
    id,
    value,
    color,
  }: {
    id: number;
    value?: string;
    color?: string | null;
  }) => {
    if (!value) value = undefined;

    setLoadingIdEdit(id);
    await onEdit({ id, value: value?.trim(), color }).finally(() => {
      setLoadingIdEdit(false);
    });
  };

  const handleDelete = async (id: number) => {
    setLoadingIdDelete(id);
    await onDelete(id).finally(() => {
      setLoadingIdDelete(false);
    });
  };

  const defaultColor = 'gray.200';
  const showAdd = adding || (isLoading && !!addInputRef.current?.value);

  return (
    <SPopperArrow
      disabledArrow
      placement="bottom-start"
      anchorEl={anchorEl}
      isOpen={isOpen}
      close={close}
      color="paper"
    >
      <SFlex direction="column" width={300} gap={0} px={5} pt={5} pb={4}>
        <SFlex align="center" justify="space-between" mb={4}>
          <SFlex
            align="center"
            gap={0}
            onClick={close}
            mb={3}
            sx={{
              cursor: 'pointer',
              color: 'text.light',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <KeyboardArrowLeftIcon sx={{ fontSize: 18, color: 'inherit' }} />
            <SText
              sx={{
                fontSize: '11px',
                fontWeight: 400,
                color: 'inherit',
              }}
            >
              Opções
            </SText>
          </SFlex>

          <SIconButton
            onClick={() => setAdding(true)}
            iconButtonProps={{
              sx: {
                width: 20,
                height: 20,
              },
            }}
          >
            <SIconAdd color="text.primary" fontSize={14} />
          </SIconButton>
        </SFlex>
        <SFlex direction={'column'} gap={4} mb={4}>
          {showAdd && (
            <Input
              autoFocus
              inputRef={addInputRef}
              disableUnderline
              disabled={loadingAdd || isLoading}
              placeholder="..."
              fullWidth
              onBlur={(e) => e?.target?.value && handleAdd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd(e.currentTarget.value);
                }
              }}
              sx={{
                fontSize: '13px',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
              }}
              startAdornment={
                <Box
                  sx={{
                    mr: 4,
                    width: 8,
                    backgroundColor: defaultColor,
                    height: '30px',
                    borderBottomLeftRadius: 4,
                    borderTopLeftRadius: 4,
                  }}
                />
              }
              endAdornment={
                <SFlex gap={1} mr={4}>
                  {loadingAdd || isLoading ? (
                    <CircularProgress color="inherit" size={12} />
                  ) : (
                    <SIconButton
                      iconButtonProps={{
                        sx: {
                          width: 25,
                          height: 25,
                        },
                      }}
                    >
                      <SubdirectoryArrowLeftIcon
                        sx={{ fontSize: 18, color: 'grey.600' }}
                      />
                    </SIconButton>
                  )}
                </SFlex>
              }
            />
          )}
          {options.map((option) => {
            const isDisabled =
              loadingIdEdit === option.id ||
              loadingIdDelete === option.id ||
              isLoading;

            return (
              <Input
                key={option.id}
                disableUnderline
                defaultValue={option.name}
                placeholder="procurar ou adicionar"
                fullWidth
                disabled={isDisabled}
                onBlur={(e) =>
                  e.target.value != option.name &&
                  handleEdit({ id: option.id, value: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEdit({
                      id: option.id,
                      value: e.currentTarget.value,
                    });
                  }
                }}
                sx={{
                  fontSize: '13px',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                }}
                startAdornment={
                  <Box
                    sx={{
                      mr: 4,
                      width: 8,
                      backgroundColor: option.color || defaultColor,
                      height: '30px',
                      borderBottomLeftRadius: 4,
                      borderTopLeftRadius: 4,
                    }}
                  />
                }
                endAdornment={
                  <SFlex gap={1} mr={4}>
                    {isDisabled ? (
                      <CircularProgress color="inherit" size={12} />
                    ) : (
                      <>
                        <PopperColorPicker
                          onSelect={(color) =>
                            handleEdit({
                              id: option.id,
                              color,
                            })
                          }
                        />
                        <SIconButton
                          onClick={() => handleDelete(option.id)}
                          iconButtonProps={{
                            sx: {
                              width: 25,
                              height: 25,
                            },
                          }}
                        >
                          <SIconDelete fontSize={18} />
                        </SIconButton>
                      </>
                    )}
                  </SFlex>
                }
              />
            );
          })}
        </SFlex>
        <SButton
          onClick={() => setAdding(true)}
          buttonProps={{ sx: { height: 25, width: 100 } }}
          text={'Adicionar'}
          color="paper"
          icon={<SIconAdd fontSize={18} />}
        />
        {/* <SButton
              // buttonProps={{ sx: { mt: 4, width: 100, ml: 'auto' } }}
              onClick={() => null}
              text={'Salvar'}
              color="primary"
            /> */}
      </SFlex>
    </SPopperArrow>
  );
}
