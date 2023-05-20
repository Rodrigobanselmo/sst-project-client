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
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import { initialDocumentState } from 'components/organisms/modals/ModalAddDocument/hooks/useAddDocument';
import dayjs from 'dayjs';

import SAddIcon from 'assets/icons/SAddIcon';
import SDownloadIcon from 'assets/icons/SDownloadIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IDocument } from 'core/interfaces/api/IDocument';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
import { dateToString } from 'core/utils/date/date-format';
import { sortDate } from 'core/utils/sorts/data.sort';

export const DocumentsHistoryTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (group: IDocument) => void;
      hideTitle?: boolean;
      companyId?: string;
      documents: IDocument[];
    }
> = ({ rowsPerPage = 8, documents, onSelectData, hideTitle, companyId }) => {
  const { handleSearchChange } = useTableSearchAsync();

  const isSelect = !!onSelectData;
  const documentMain = documents?.[0];
  const downloadMutation = useMutDownloadFile();

  const { onStackOpenModal } = useModal();

  const onAddDocument = () => {
    onStackOpenModal(ModalEnum.DOCUMENT_ADD_YEAR, {
      companyId,
      parentDocumentId: documentMain?.id,
      name: documentMain?.name,
    } as Partial<typeof initialDocumentState>);
  };

  const onSelectRow = (group: IDocument) => {
    if (isSelect) {
      onSelectData(group);
    } else onEditDocument(group);
  };

  const onEditDocument = (group: IDocument) => {
    onStackOpenModal(ModalEnum.DOCUMENT_ADD_YEAR, {
      ...group,
    } as Partial<typeof initialDocumentState>);
  };

  const onDownloadFile = (document: IDocument) => {
    downloadMutation.mutate(
      `company/${document.companyId}/document/${document.id}/download`,
    );
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(150px, 2fr)' },
    // { text: 'Tipo', column: '80px' },
    // { text: 'início', column: '80px', justifyContent: 'center' },
    { text: 'Vencimento', column: '100px', justifyContent: 'center' },
    { text: 'Baixar', column: '50px', justifyContent: 'center' },
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
        <STableBody<(typeof documents)[0]>
          rowsData={documents.sort((a, b) =>
            sortDate(
              b.endDate || new Date('3000-01-01T00:00:00.00Z'),
              a.endDate || new Date('3000-01-01T00:00:00.00Z'),
            ),
          )}
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
                  text={dateToString(row.endDate, 'MM/YYYY') || '-'}
                />
                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadFile(row);
                  }}
                  loading={downloadMutation.isLoading}
                  disabled={!row.fileUrl}
                  icon={<SDownloadIcon sx={{ color: 'primary.main' }} />}
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
      <STagButton
        onClick={onAddDocument}
        maxWidth={250}
        mt={2}
        icon={SAddIcon}
        text={'Adcionar versão atualizada'}
        active
        bg={'success.dark'}
      />
    </>
  );
};
