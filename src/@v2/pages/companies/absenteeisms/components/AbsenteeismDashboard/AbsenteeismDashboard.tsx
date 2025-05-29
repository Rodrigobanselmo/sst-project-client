import { Box } from '@mui/material';
import { GraphBarTotal } from './graphs/GraphBarTotal/GraphBarTotal';
import { GraphPieType } from './graphs/GraphPieType/GraphPieType';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { GraphPieRangeDays } from './graphs/GraphPieRangeDays/GraphPieRangeDays';
import { TableEmployeeTotal } from './tables/table-employee-total/TableEmployeeTotal';
import { TableHierarchyTotal } from './tables/table-hierarchy-total/TableHierarchyTotal';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { PopperSidebar } from '@v2/components/forms/fields/SSearchSelect/components/PopperSelect/addons/PopperSidebar';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';

export const AbsenteeismDashboard = ({ companyId }: { companyId: string }) => {
  const { queryParams, setQueryParams } = useQueryParamsState<{
    workspacesIds: string[];
  }>();

  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });

  return (
    <Box width={'100%'}>
      <SFlex gap={6} pb={8}>
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
          onInputChange={(value) => console.log(value)}
          placeholder="selecione um ou mais status"
          options={workspaces?.shortResults || []}
        />
      </SFlex>
      <SFlex gap={6} flexDirection="column">
        <SFlex gap={6} display="grid" gridTemplateColumns="1fr">
          <TableHierarchyTotal
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
          />
        </SFlex>
        <SFlex gap={6} display="grid" gridTemplateColumns="1fr 450px">
          <GraphBarTotal
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
          />
          <GraphPieRangeDays
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
          />
        </SFlex>
        <SFlex gap={6} display="grid" gridTemplateColumns="500px 1fr">
          <GraphPieType
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
          />
          <TableEmployeeTotal
            companyId={companyId}
            workspacesIds={queryParams.workspacesIds}
          />
        </SFlex>
      </SFlex>
    </Box>
  );
};
