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
import { STagButton } from 'components/atoms/STagButton';
import { initialContactState } from 'components/organisms/modals/ModalAddContact/hooks/useAddContact';
import { initialDocumentState } from 'components/organisms/modals/ModalAddDocument/hooks/useAddDocument';
import dayjs from 'dayjs';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { documentTypeMap } from 'core/constants/maps/document-type.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IDocument } from 'core/interfaces/api/IDocument';
import { useQueryDocuments } from 'core/services/hooks/queries/documents/useQueryDocuments/useQueryDocuments';
import { dateToString } from 'core/utils/date/date-format';

export const DocumentsTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (group: IDocument) => void;
      hideTitle?: boolean;
      companyId?: string;
    }
> = ({ rowsPerPage = 8, onSelectData, hideTitle, companyId }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryDocuments(page, { search }, rowsPerPage, companyId);

  const isSelect = !!onSelectData;

  const { onStackOpenModal } = useModal();

  const onAddDocument = () => {
    onStackOpenModal(ModalEnum.DOCUMENT_ADD, { companyId } as Partial<
      typeof initialDocumentState
    >);
  };

  const onSelectRow = (group: IDocument) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditDocument(group);
  };

  const onEditDocument = (group: IDocument) => {
    onStackOpenModal(ModalEnum.DOCUMENT_ADD, {
      // ...group,
      id: group.id,
    } as Partial<typeof initialDocumentState>);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(150px, 2fr)' },
    { text: 'Tipo', column: '120px', justifyContent: 'center' },
    { text: 'início', column: '80px', justifyContent: 'center' },
    { text: 'Vencimento', column: '120px', justifyContent: 'center' },
    { text: 'Editar', column: '50px', justifyContent: 'center' },
  ];

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>Documentos</STableTitle>
          <STableSearch
            onAddClick={onAddDocument}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </>
      )}
      <STable
        loading={loadGroup}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ column, text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<(typeof group)[0]>
          rowsData={group}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                <TextIconRow clickable text={row.name || '-'} />
                <TextIconRow
                  justifyContent="center"
                  clickable
                  text={documentTypeMap[row.type]?.content || '-'}
                />
                <TextIconRow
                  justifyContent="center"
                  clickable
                  text={dateToString(row.startDate, 'MM/YYYY') || '-'}
                />
                <TextIconRow
                  justifyContent="center"
                  clickable
                  textProps={{
                    color: dayjs().isAfter(row.endDate)
                      ? 'error.main'
                      : undefined,
                  }}
                  text={dateToString(row.endDate, 'MM/YYYY') || '-'}
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDocument(row);
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
