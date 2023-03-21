import { FC } from 'react';

import { BoxProps } from '@mui/material';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { initialCatState } from 'components/organisms/modals/ModalAddCat/hooks/useAddCat';
import { initialEditDocumentModelState } from 'components/organisms/modals/ModalEditDocumentModel/hooks/useEditDocumentModel';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import EditIcon from 'assets/icons/SEditIcon';

import { documentTypeMap } from 'core/constants/maps/document-type.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';
import {
  IQueryDocumentModels,
  useQueryDocumentModels,
} from 'core/services/hooks/queries/useQueryDocumentModels/useQueryDocumentModels';
import { dateToString } from 'core/utils/date/date-format';

export const DocumentModelTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IDocumentModel) => void;
    hideTitle?: boolean;
    companyId?: string;
    title?: string;
    query?: IQueryDocumentModels;
  }
> = ({
  rowsPerPage = 12,
  title,
  onSelectData,
  hideTitle,
  companyId,
  query,
  children,
}) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: documentModel,
    isLoading: loadGroup,
    count,
  } = useQueryDocumentModels(
    page,
    { search, ...query },
    rowsPerPage,
    companyId,
  );

  const isSelect = !!onSelectData;

  const { onStackOpenModal } = useModal();

  const onAddModel = () => {
    onStackOpenModal(ModalEnum.DOCUMENT_MODEL_EDIT_DATA, {
      type: DocumentTypeEnum.PGR,
      companyId,
    } as typeof initialEditDocumentModelState);
  };

  const onSelectRow = (documentModel: IDocumentModel) => {
    if (isSelect) {
      onSelectData(documentModel);
    } else onEditModel(documentModel);
  };

  const onEditModel = (documentModel: IDocumentModel) => {
    onStackOpenModal(ModalEnum.DOCUMENT_MODEL_EDIT_DATA, {
      id: documentModel.id,
      title: 'Modelo Documento PGR',
      companyId: documentModel.companyId,
    } as typeof initialEditDocumentModelState);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(150px, 200px)' },
    { text: 'Descrição', column: 'minmax(200px, 1fr)' },
    { text: 'Tipo', column: '100px' },
    { text: 'Criação', column: 'minmax(100px, 130px)' },
    { text: 'Status', column: '150px' },
    { text: 'Editar', column: '50px' },
  ];

  return (
    <>
      <>
        {!hideTitle && (
          <STableTitle>{title || 'Modelos de Documentos'}</STableTitle>
        )}
        <STableSearch
          onAddClick={onAddModel}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {children}
      </>
      <STable
        loading={loadGroup}
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
        <STableBody<typeof documentModel[0]>
          rowsData={documentModel}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
                status={row.status == 'CANCELED' ? 'inactive' : undefined}
              >
                <TextIconRow text={row.name} />
                <TextIconRow text={row?.description?.trim()} />
                <TextIconRow text={documentTypeMap[row.type]?.content} />
                <TextIconRow text={`${dateToString(row.created_at)}`} />
                <StatusSelect
                  large
                  sx={{ maxWidth: '100px' }}
                  selected={row.status}
                  statusOptions={[]}
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditModel(row);
                  }}
                  icon={<EditIcon />}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadGroup ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
