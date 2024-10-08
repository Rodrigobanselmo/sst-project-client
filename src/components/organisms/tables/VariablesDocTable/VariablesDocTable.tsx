import { FC } from 'react';
import { useForm } from 'react-hook-form';

import { Box, BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHRow,
  STableHeader,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import { InputForm } from 'components/molecules/form/input';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';
import {
  setDocumentModelAddVariable,
  setDocumentModelRemoveVariable,
} from 'store/reducers/document/documentSlice';

import { SDeleteIcon } from 'assets/icons/SDeleteIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';
import { sortString } from 'core/utils/sorts/string.sort';

export interface IVariableDocument {
  type: string;
  label: string;
}

export const VariablesDocTable: FC<
  { children?: any } & BoxProps & {
      data: IVariableDocument[];
      rowsPerPage?: number;
      onSelectData?: (company: IVariableDocument) => void;
      selectedData?: IVariableDocument[];
      onAdd?: () => void;
      loading?: boolean;
      onlyShow?: boolean;
      variables?: IDocumentModelFull['variables'];
    }
> = ({
  rowsPerPage = 12,
  onAdd,
  selectedData,
  onSelectData,
  loading,
  data,
  onlyShow,
  variables,
  children,
}) => {
  const isSelect = !!onSelectData;
  const { preventDelete } = usePreventAction();
  const { onStackOpenModal } = useModal();
  const { control, getValues, setError, setValue, clearErrors, reset } =
    useForm();
  const dispatch = useAppDispatch();

  const onAddVariables = () => {
    if (onlyShow) return;
    onAdd?.();
    reset();

    const onAddVar = (data: any, onClose: () => void) => {
      const { type, label } = getValues();
      clearErrors();

      if (!type) {
        setError('type', { message: 'Campo obrigatório' });
        return;
      }

      if (!label) {
        setError('label', { message: 'Campo obrigatório' });
        return;
      }

      if (variables && variables[type]) {
        setError('type', { message: 'Nome já existe' });
        return;
      }

      const newData = {
        type,
        label,
      };

      dispatch(setDocumentModelAddVariable(newData));

      onClose();
    };

    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      title: 'Adicionar Variáveis',
      handleOnClose: true,
      onSelect: onAddVar,
      content: () => (
        <Box minWidth={[500, 600, 700]}>
          <InputForm
            label={'Nome'}
            placeholder={'Nome'}
            setValue={setValue}
            defaultValue={''}
            control={control}
            labelPosition="center"
            fullWidth
            name="type"
            sx={{ mb: 10 }}
          />
          <InputForm
            label={'Texto'}
            placeholder={'Texto'}
            setValue={setValue}
            defaultValue={''}
            control={control}
            labelPosition="center"
            fullWidth
            name="label"
            multiline
            sx={{ mb: 10 }}
          />
        </Box>
      ),
    } as Partial<typeof initialBlankState>);
  };

  const onEdit = (variable: IVariableDocument) => {
    if (onlyShow) return;
    reset();

    const onEditVar = (data: any, onClose: () => void) => {
      const { type, label } = getValues();
      clearErrors();

      if (!type) {
        setError('type', { message: 'Campo obrigatório' });
        return;
      }

      if (!label) {
        setError('label', { message: 'Campo obrigatório' });
        return;
      }

      if (variables && variables[type]) {
        setError('type', { message: 'Nome já existe' });
        return;
      }

      const newData = {
        ...variable,
        type,
        label,
      };

      dispatch(setDocumentModelAddVariable(newData));

      onClose();
    };

    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      title: 'Variáveis',
      handleOnClose: true,
      onSelect: onEditVar,
      content: () => (
        <Box minWidth={[500, 600, 700]}>
          <InputForm
            label={'Nome'}
            placeholder={'Nome'}
            setValue={setValue}
            defaultValue={variable.type}
            control={control}
            labelPosition="center"
            fullWidth
            name="type"
            sx={{ mb: 10 }}
            disabled={true}
          />
          <InputForm
            label={'Texto'}
            placeholder={'Texto'}
            setValue={setValue}
            defaultValue={variable.label}
            control={control}
            labelPosition="center"
            fullWidth
            name="label"
            multiline
            sx={{ mb: 10 }}
          />
        </Box>
      ),
    } as Partial<typeof initialBlankState>);
  };

  const onDelete = (variable: IVariableDocument) => {
    if (onlyShow) return;
    dispatch(setDocumentModelRemoveVariable(variable));
  };

  const onSelectRow = (v: IVariableDocument) => {
    if (isSelect) {
      onSelectData(v);
    } else onEdit(v);
  };

  const { handleSearchChange, results, page, setPage } = useTableSearch({
    rowsPerPage: 8,
    data: data || [],
    keys: ['type', 'label'],
    sort: (a, b) => sortString(a.type, b.type),
  });

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: '250px' },
    { text: 'Texto', column: 'minmax(250px, 1fr)' },
    { text: 'Remover', column: '80px', justifyContent: 'center' },
  ];
  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      <STableSearch
        onAddClick={onAddVariables}
        onChange={(e) => handleSearchChange(e.target.value)}
        addText=""
      />
      {children}
      <STable
        loading={loading}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<IVariableDocument>
          rowsData={results}
          rowsInitialNumber={rowsPerPage}
          hideLoadMore
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.type}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={
                      !!selectedData.find(
                        (variable) => variable.type === row.type,
                      )
                    }
                  />
                )}
                <TextIconRow clickable text={row.type} />
                <TextIconRow clickable text={row.label} />
                <SFlex center>
                  <IconButtonRow
                    icon={<SDeleteIcon />}
                    tooltipTitle="deletar"
                    sx={{ svg: { fontSize: 18 }, height: 20 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      preventDelete(() => onDelete(row));
                    }}
                  />
                </SFlex>
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loading ? undefined : data.length}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
