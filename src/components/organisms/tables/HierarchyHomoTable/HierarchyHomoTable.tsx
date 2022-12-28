import { FC } from 'react';

import { BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import { STable, STableBody, STableRow } from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import { useStartEndDate } from 'components/organisms/modals/ModalAddCharacterization/hooks/useStartEndDate';
import dayjs from 'dayjs';

import { SDeleteIcon } from 'assets/icons/SDeleteIcon';

import { usePreventAction } from 'core/hooks/usePreventAction';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IHierarchyOnHomogeneous } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutDeleteHierarchyGho } from 'core/services/hooks/mutations/checklist/gho/useMutDeleteHierarchyGho/useMutDeleteHierarchyGho';
import { useMutUpdateHierarchyGho } from 'core/services/hooks/mutations/checklist/gho/useMutUpdateHierarchyGho/useMutUpdateHierarchyGho';
import { dateToString } from 'core/utils/date/date-format';
import { sortDate } from 'core/utils/sorts/data.sort';
import { sortString } from 'core/utils/sorts/string.sort';

export const HierarchyHomoTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (company: IHierarchy) => void;
    selectedData?: IHierarchy[];
    // query?: IQueryExam;
    onAdd?: () => void;
    hierarchies: IHierarchy[];
    loading: boolean;
  }
> = ({
  rowsPerPage = 8,
  onAdd,
  selectedData,
  onSelectData,
  loading,
  hierarchies,
}) => {
  // const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const isSelect = !!onSelectData;
  const { selectStartEndDate } = useStartEndDate();
  const updateMutation = useMutUpdateHierarchyGho();
  const deleteMutation = useMutDeleteHierarchyGho();
  const { preventDelete } = usePreventAction();

  // const {
  //   data: exams,
  //   isLoading: loading,
  //   count,
  // } = useQueryExams(page, { search }, rowsPerPage);
  // const count = hierarchies.length;

  // const { onStackOpenModal } = useModal();

  const onAddExam = () => {
    onAdd?.();
    // onStackOpenModal(ModalEnum.EXAMS_ADD, {} as typeof initialExamState);
  };

  const onEdit = (h: IHierarchy & IHierarchyOnHomogeneous) => {
    //! missing edit when creating
    if (h.workspaceId)
      selectStartEndDate(
        (data) => {
          updateMutation.mutate({
            workspaceId: h.workspaceId,
            ids: [h.id],
            endDate: data.endDate,
            startDate: data.startDate,
            companyId: h.companyId,
          });
        },
        {
          endDate: h.endDate ? dayjs(h.endDate).toDate() : undefined,
          startDate: h.startDate ? dayjs(h.startDate).toDate() : undefined,
        },
      );
  };

  const onDelete = (h: IHierarchy & IHierarchyOnHomogeneous) => {
    if (h.workspaceId) {
      deleteMutation.mutate({
        workspaceId: h.workspaceId,
        ids: [h.id],
        companyId: h.companyId,
      });
    }
  };

  const onSelectRow = (exam: IHierarchy & IHierarchyOnHomogeneous) => {
    if (isSelect) {
      onSelectData(exam);
    } else onEdit(exam);
  };

  const { handleSearchChange, results } = useTableSearch({
    data: hierarchies.reduce((acc, curr) => {
      const newData = curr.hierarchyOnHomogeneous?.map((h) => ({
        ...curr,
        ...h,
      })) || [curr];

      return [...acc, ...(newData || [])];
    }, [] as any[]),
    keys: ['name', 'label'],
  });

  return (
    <>
      <STableSearch
        onAddClick={onAddExam}
        onChange={(e) => handleSearchChange(e.target.value)}
        addText="Editar cargos"
      />
      <STable
        loading={loading}
        rowsNumber={rowsPerPage}
        columns={`${
          selectedData ? '15px ' : ''
        }minmax(250px, 5fr) 120px 120px 50px`}
      >
        {/* <STableHeader>
          {selectedData && <STableHRow></STableHRow>}
          <STableHRow>Nome</STableHRow>
          <STableHRow>Análise</STableHRow>
          <STableHRow>Material</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader> */}
        <STableBody<IHierarchy & IHierarchyOnHomogeneous>
          rowsData={results
            .sort((a, b) => sortDate(b?.endDate, a?.endDate))
            .sort((a, b) =>
              sortString(a?.name || a?.label, b?.name || a?.label),
            )}
          // hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const fromTree = row && 'label' in row;
            const name = fromTree ? (row as any).label : row.name;
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
                status={row.endDate ? 'inactive' : 'none'}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={!!selectedData.find((exam) => exam.id === row.id)}
                  />
                )}
                <TextIconRow clickable text={name || '-'} />
                <TextIconRow
                  clickable
                  text={`inicio: ${dateToString(row.startDate)}`}
                />
                <TextIconRow
                  clickable
                  text={`fim: ${dateToString(row.endDate)}`}
                />
                {row.workspaceId ? (
                  <IconButtonRow
                    icon={<SDeleteIcon />}
                    tooltipTitle="deletar"
                    sx={{ svg: { fontSize: 18 }, height: 20 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      preventDelete(() => onDelete(row));
                    }}
                  />
                ) : (
                  <div />
                )}
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      {/* <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loading ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      /> */}
    </>
  );
};
