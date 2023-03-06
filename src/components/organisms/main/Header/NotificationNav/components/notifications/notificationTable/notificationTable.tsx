import { FC } from 'react';

import { Box, BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
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
import SText from 'components/atoms/SText';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';
import SMailFullIcon from 'assets/icons/SMailFullIcon';
import SMailIcon from 'assets/icons/SMailIcon';
import SReadMessage from 'assets/icons/SReadMessage';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IExam } from 'core/interfaces/api/IExam';
import { INotification } from 'core/interfaces/api/INotification';
import { useMutMakAsReadNotification } from 'core/services/hooks/mutations/notification/useMutMakAsReadNotification/useMutMakAsReadNotification';
import {
  IQueryExam,
  useQueryExams,
} from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import {
  IQueryNotification,
  useQueryNotifications,
} from 'core/services/hooks/queries/useQueryNotifications/useQueryNotifications';
import { dateFromNow } from 'core/utils/date/date-format';

export const NotificationTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (notification: INotification) => void;
    selectedData?: INotification[];
    query?: IQueryNotification;
  }
> = ({ rowsPerPage = 10, onSelectData, selectedData }) => {
  const { page, setPage } = useTableSearchAsync();

  const isSelect = !!onSelectData;

  const {
    data: notifications,
    isLoading: loadNot,
    count,
  } = useQueryNotifications(page, {}, rowsPerPage);

  const readMutation = useMutMakAsReadNotification();
  const { onStackOpenModal } = useModal();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const onAddExam = () => {
    onStackOpenModal(ModalEnum.EXAMS_ADD, {} as typeof initialExamState);
  };

  const onMarkAsReadNotification = (notification: INotification) => {
    readMutation.mutateAsync({ id: notification.id });
  };

  const onSelectRow = (exam: INotification) => {
    if (isSelect) {
      onSelectData(exam);
    }
    // else onMarkAsReadNotification(exam);
  };

  return (
    <Box p={5}>
      {/* {!isSelect && <STableTitle icon={SExamIcon}>Exames</STableTitle>} */}
      {/* <STableSearch
        onAddClick={onAddExam}
        onChange={(e) => handleSearchChange(e.target.value)}
      /> */}
      <STable
        loading={loadNot}
        rowsNumber={rowsPerPage}
        columns={`${selectedData ? '15px ' : ''}minmax(250px, 5fr) 40px`}
        maxHeight={'60vh'}
      >
        <STableBody<typeof notifications[0]>
          rowsData={notifications}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const isUnread = row?.confirmations?.length == 0;
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
                status={isUnread ? undefined : 'fade'}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={!!selectedData.find((exam) => exam.id === row.id)}
                  />
                )}
                <Box>
                  <SText mb={2} fontSize={12} fontWeight={600}>
                    {dateFromNow(row.created_at)}
                  </SText>
                  <TextIconRow
                    lineHeight={1.15}
                    lineNumber={3}
                    clickable
                    tooltipTitle={row.json?.message}
                    text={
                      <>
                        {row.json?.title && (
                          <SText fontSize={14} fontWeight={600}>
                            {row.json.title}
                          </SText>
                        )}
                        <span>
                          {row.json?.subtitle ||
                            row.json?.message ||
                            'Nova menssagem'}
                        </span>
                      </>
                    }
                  />
                </Box>
                <IconButtonRow
                  icon={isUnread ? <SMailFullIcon /> : <SReadMessage />}
                  tooltip="Marcar como lida"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isUnread) onMarkAsReadNotification(row);
                  }}
                />
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadNot ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </Box>
  );
};
