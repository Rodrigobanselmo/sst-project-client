import { STableSelection } from '@v2/components/organisms/STable/addons/addons-table/STableSelectionUpdate/STableSelectionUpdate';
import {
  TablesSelectEnum,
  useTableSelect,
} from '@v2/components/organisms/STable/hooks/useTableSelect';

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

  return <STableSelection table={table}>{null}</STableSelection>;
};
