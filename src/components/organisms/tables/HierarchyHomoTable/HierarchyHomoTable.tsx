import { FC } from 'react';

import { Box, BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import { STable, STableBody, STableRow } from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import SText from 'components/atoms/SText';
import { useStartEndDate } from 'components/organisms/modals/ModalAddCharacterization/hooks/useStartEndDate';
import dayjs from 'dayjs';

import { SDeleteIcon } from 'assets/icons/SDeleteIcon';

import { originRiskMap } from 'core/constants/maps/origin-risk';
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
  { children?: any } & BoxProps & {
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
    selectStartEndDate(
      (data) => {
        updateMutation.mutate({
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
    deleteMutation.mutate({
      ids: [h.id],
      companyId: h.companyId,
    });
  };

  const onSelectRow = (hier: IHierarchy & IHierarchyOnHomogeneous) => {
    if (isSelect) {
      onSelectData(hier);
    } else onEdit(hier);
  };

  const data = hierarchies.reduce((acc, curr) => {
    const newData = curr.hierarchyOnHomogeneous?.map((h) => ({
      ...curr,
      ...h,
    })) || [curr];

    return [...acc, ...(newData || [])];
  }, [] as any[]);

  const { handleSearchChange, results, page, setPage } = useTableSearch({
    rowsPerPage: 8,
    data,
    keys: ['name', 'label'],
  });

  const getName = (row: IHierarchy) => {
    const parents = row?.parents || [];
    const fullPath = [row, ...parents].reverse();

    const sector = row?.parents?.find((p) => p.type == 'SECTOR');
    const sub_sector = row?.parents?.find((p) => p.type == 'SUB_SECTOR');
    const path = [row.name];
    if (sub_sector?.name) path.push(sub_sector?.name);
    if (sector?.name) path.push(sector?.name);

    const name =
      row.type == 'OFFICE'
        ? path.reverse().join(' --> ')
        : `${path.length > 1 ? path.reverse().join(' --> ') : row.name} (${
            originRiskMap[row.type]?.name
          })`;
    return { fullPath, name };
  };

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
        <STableBody<
          IHierarchy & IHierarchyOnHomogeneous & { fullPath: IHierarchy[] }
        >
          rowsData={results
            .map((r) => ({ ...r, ...getName(r) }))
            .sort((a, b) => sortDate(b?.endDate, a?.endDate))
            .sort((a, b) => sortString(a?.name, b?.name))}
          // hideLoadMore
          rowsInitialNumber={rowsPerPage}
          hideLoadMore
          renderRow={(row) => {
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
                <TextIconRow
                  clickable
                  tooltipTitle={
                    <Box>
                      {row.fullPath.map((p) => (
                        <SText fontSize={10} color="white" key={p.name}>
                          {originRiskMap[p.type].name}:{' '}
                          <SText color="white" component="span" fontSize={12}>
                            {p.name}
                          </SText>
                        </SText>
                      ))}
                    </Box>
                  }
                  text={row.name || '-'}
                  tooltipProps={{
                    minLength: 10,
                  }}
                />
                <TextIconRow
                  clickable
                  text={`inicio: ${dateToString(row.startDate)}`}
                />
                <TextIconRow
                  clickable
                  text={`fim: ${dateToString(row.endDate)}`}
                />
                <IconButtonRow
                  icon={<SDeleteIcon />}
                  tooltipTitle="deletar"
                  sx={{ svg: { fontSize: 18 }, height: 20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    preventDelete(() => onDelete(row));
                  }}
                />
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
