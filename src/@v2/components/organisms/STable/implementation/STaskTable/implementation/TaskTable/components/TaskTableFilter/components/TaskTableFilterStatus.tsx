import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { ITaskFilterProps } from '@v2/components/organisms/STable/implementation/STaskTable/STaskTable.types';

interface TaskTableFilterStatusProps {
  onFilterData: (props: ITaskFilterProps) => void;
  status: {
    id: number;
    name: string;
    color?: string;
  }[];
  selectedStatus: {
    id: number;
    name: string;
    color?: string;
  }[];
}

export const TaskTableFilterStatus = ({
  selectedStatus,
  status,
  onFilterData,
}: TaskTableFilterStatusProps) => {
  return (
    <>
      <SSearchSelectMultiple
        label="Status"
        value={selectedStatus}
        getOptionLabel={(option) => option?.name}
        getOptionValue={(option) => option?.id}
        onChange={(option) =>
          onFilterData({ statusIds: option.map((o) => o.id) })
        }
        onInputChange={(value) => console.log(value)}
        placeholder="selecione um ou mais status"
        options={status}
      />
    </>
  );
};
