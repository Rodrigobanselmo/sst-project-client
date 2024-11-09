import { TablesSelectEnum } from '../../../hooks/useTableSelect';

export type SSelectRowProps = {
  id: string;
  table: TablesSelectEnum;
};

export type SSelectHRowProps = {
  ids: string[];
  table: TablesSelectEnum;
};
