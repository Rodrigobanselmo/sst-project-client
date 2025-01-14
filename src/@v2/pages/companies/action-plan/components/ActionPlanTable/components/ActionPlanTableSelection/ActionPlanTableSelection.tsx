import { STableSelection } from '@v2/components/organisms/STable/addons/addons-table/STableSelectionUpdate/STableSelectionUpdate';
import {
  TablesSelectEnum,
  useTableSelect,
} from '@v2/components/organisms/STable/hooks/useTableSelect';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { ActionPlanTableResponsibleSelection } from './components/ActionPlanTableResponsibleSelection';
import { ActionPlanTableStatusSelection } from './components/ActionPlanTableStatusSelection';
import { ActionPlanTableValiditySelection } from './components/ActionPlanTableValiditySelection';

interface ActionPlanTableSelectionProps {
  table: TablesSelectEnum;
  companyId: string;
}

export const ActionPlanTableSelection = ({
  table,
  companyId,
}: ActionPlanTableSelectionProps) => {
  useTableSelect((state) => state.versions[table]); // used to rerender page on id change
  const selectedIds = useTableSelect((state) => state.getIds)(table)();

  const getIds = () => {
    return selectedIds.map((id) => ActionPlanBrowseResultModel.fromId(id));
  };

  return (
    <STableSelection table={table}>
      <ActionPlanTableStatusSelection getIds={getIds} companyId={companyId} />
      <ActionPlanTableResponsibleSelection
        getIds={getIds}
        companyId={companyId}
      />
      <ActionPlanTableValiditySelection getIds={getIds} companyId={companyId} />
    </STableSelection>
  );
};
