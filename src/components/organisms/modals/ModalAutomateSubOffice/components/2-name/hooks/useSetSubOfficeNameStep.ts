import { useFormContext } from 'react-hook-form';

import { useMutAutomateHierarchySubOffice } from 'core/services/hooks/mutations/checklist/hierarchy/useMutAutomateHierarchySubOffice ';

import { IUseAutomateSubOffice } from '../../../hooks/useHandleActions';

export const useSetSubOfficeNameStep = ({
  onClose,
  data,
  ...rest
}: IUseAutomateSubOffice) => {
  const { trigger, getValues, control, reset, clearErrors } = useFormContext();

  const upsertSubOffice = useMutAutomateHierarchySubOffice();

  const fields = ['name', 'description'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { name, description } = getValues();

      await upsertSubOffice
        .mutateAsync({
          name: `${data.hierarchy?.name || 'Cargo Desenvolvido'} (${name})`,
          realDescription: description,
          employeesIds: data.selectedEmployees.map((employee) => employee.id),
          parentId: data.hierarchyId,
        })
        .then((hierarchyResp) => {
          onClose();
          data.callback(hierarchyResp);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return {
    onSubmit,
    loading: upsertSubOffice.isLoading,
    control,
    onCloseUnsaved,
    clearErrors,
  };
};
