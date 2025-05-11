import { STableSelection } from '@v2/components/organisms/STable/addons/addons-table/STableSelectionUpdate/STableSelectionUpdate';
import {
  TablesSelectEnum,
  useTableSelect,
} from '@v2/components/organisms/STable/hooks/useTableSelect';
import { StatusBrowseResultModel } from '@v2/models/security/models/status/status-browse-result.model';
import { TaskTableValiditySelection } from './components/TaskTableValiditySelection';
import { TaskTableResponsibleSelection } from './components/TaskTableResponsibleSelection';
import { TaskTableStatusSelection } from './components/TaskTableStatusSelection';

interface TaskTableSelectionProps {
  table: TablesSelectEnum;
  companyId: string;
  onEditMany: (props: { ids: number[]; statusId?: number | null }) => void;
  status: StatusBrowseResultModel[];
}

export const TaskTableSelection = ({
  table,
  companyId,
  onEditMany,
  status,
}: TaskTableSelectionProps) => {
  useTableSelect((state) => state.versions[table]); // used to rerender page on id change
  const selectedIds = useTableSelect((state) => state.getIds)(table)().map(
    Number,
  );

  return (
    <STableSelection table={table}>
      <TaskTableStatusSelection
        onEditMany={({ statusId }) =>
          onEditMany({ ids: selectedIds, statusId })
        }
        status={status}
      />
      <TaskTableResponsibleSelection
        companyId={companyId}
        selectedIds={selectedIds}
      />
      <TaskTableValiditySelection
        companyId={companyId}
        selectedIds={selectedIds}
      />
    </STableSelection>
  );
};
