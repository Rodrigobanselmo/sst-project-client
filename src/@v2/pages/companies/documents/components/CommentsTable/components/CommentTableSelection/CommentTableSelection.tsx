import { STableSelection } from '@v2/components/organisms/STable/addons/addons-table/STableSelectionUpdate/STableSelectionUpdate';
import {
  TablesSelectEnum,
  useTableSelect,
} from '@v2/components/organisms/STable/hooks/useTableSelect';
import { CommentTableStatusSelection } from './components/CommentTableStatusSelection';

interface CommentTableSelectionProps {
  table: TablesSelectEnum;
  companyId: string;
}

export const CommentTableSelection = ({
  table,
  companyId,
}: CommentTableSelectionProps) => {
  useTableSelect((state) => state.versions[table]);
  const selectedIds = useTableSelect((state) => state.getIds)(table)();

  return (
    <STableSelection table={table}>
      <CommentTableStatusSelection ids={selectedIds} companyId={companyId} />
    </STableSelection>
  );
};
