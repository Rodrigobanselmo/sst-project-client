import { Box } from '@mui/material';
import { GraphBarTotal } from './components/graphs/GraphBarTotal/GraphBarTotal';
import { GraphPieType } from './components/graphs/GraphPieType/GraphPieType';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { GraphPieRangeDays } from './components/graphs/GraphPieRangeDays/GraphPieRangeDays';
import { TableEmployeeTotal } from './components/tables/table-employee-total/TableEmployeeTotal';
import { TableHierarchyTotal } from './components/tables/table-hierarchy-total/TableHierarchyTotal';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { PopperSidebar } from '@v2/components/forms/fields/SSearchSelect/components/PopperSelect/addons/PopperSidebar';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { SDatePicker } from '@v2/components/forms/fields/SDatePicker/SDatePicker';
import { GraphPieCompare } from './components/graphs/GraphPieCompare/GraphPieCompare';

export const AbsenteeismDashboard = ({ companyId }: { companyId: string }) => {
  const { queryParams, setQueryParams } = useQueryParamsState<{
    workspacesIds?: string[];
    startDate?: Date | '' | null;
    endDate?: Date | '' | null;
  }>();

  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });

  return (
    <Box width={'100%'}>
      <SFlex gap={6} pb={8}>
        <SSearchSelect
          label="Ano"
          boxProps={{ width: '100px' }}
          value={
            queryParams.startDate &&
            queryParams.endDate &&
            new Date(queryParams.startDate).getFullYear() ===
              new Date(queryParams.endDate).getFullYear()
              ? new Date(queryParams.startDate).getFullYear()
              : null
          }
          getOptionLabel={(option) => option.toString()}
          getOptionValue={(option) => option}
          onChange={(year) =>
            setQueryParams({
              startDate: year ? new Date(year, 0, 1) : '',
              endDate: year ? new Date(year, 11, 31) : '',
            })
          }
          placeholder="filtrar por estabelecimentos"
          options={[
            new Date().getFullYear(),
            new Date().getFullYear() - 1,
            new Date().getFullYear() - 2,
            new Date().getFullYear() - 3,
            new Date().getFullYear() - 4,
            new Date().getFullYear() - 5,
          ]}
        />
        <SSearchSelectMultiple
          label="Estabelecimentos"
          value={
            workspaces?.shortResults.filter((w) =>
              queryParams.workspacesIds?.includes(w.id),
            ) || []
          }
          getOptionLabel={(option) => option?.name}
          getOptionValue={(option) => option?.id}
          onChange={(option) =>
            setQueryParams({ workspacesIds: option.map((o) => o.id) })
          }
          loading={isLoadingAllWorkspaces}
          placeholder="filtrar por estabelecimentos"
          options={workspaces?.shortResults || []}
        />
        <SDatePicker
          label="Data Inicial"
          boxProps={{ width: '180px' }}
          value={
            queryParams.startDate === ''
              ? new Date(new Date().setFullYear(new Date().getFullYear() - 1))
              : queryParams.startDate ||
                new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
          onChange={(date) => setQueryParams({ startDate: date })}
        />
        <SDatePicker
          label="Data Final"
          boxProps={{ width: '180px' }}
          value={
            queryParams.endDate === ''
              ? new Date()
              : queryParams.endDate || new Date()
          }
          onChange={(date) => setQueryParams({ endDate: date })}
        />
      </SFlex>
      <SFlex gap={6} flexDirection="column">
        <SFlex gap={6} display="grid" gridTemplateColumns="1fr">
          <TableHierarchyTotal
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
            startDate={queryParams.startDate || undefined}
            endDate={queryParams.endDate || undefined}
          />
          <GraphPieCompare />
        </SFlex>
        <SFlex gap={6} display="grid" gridTemplateColumns="1fr 450px">
          <GraphBarTotal
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
            startDate={queryParams.startDate || undefined}
            endDate={queryParams.endDate || undefined}
          />
          <GraphPieRangeDays
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
            startDate={queryParams.startDate || undefined}
            endDate={queryParams.endDate || undefined}
          />
        </SFlex>
        <SFlex gap={6} display="grid" gridTemplateColumns="500px 1fr">
          <GraphPieType
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
            startDate={queryParams.startDate || undefined}
            endDate={queryParams.endDate || undefined}
          />
          <TableEmployeeTotal
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
            startDate={queryParams.startDate || undefined}
            endDate={queryParams.endDate || undefined}
          />
        </SFlex>
      </SFlex>
    </Box>
  );
};
