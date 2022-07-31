import { initialUsersSelectState } from 'components/organisms/modals/ModalSelectUsers';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { IUser } from 'core/interfaces/api/IUser';

type SelectUserProfessional = IUser | IProfessional;
interface IUseEntities {
  onAdd: (value: string, data?: any | any[]) => void;
  values: any[];
  multiple?: boolean;
}

export const useAddEntities = ({
  onAdd,
  multiple = true,
  values,
}: IUseEntities) => {
  const { onStackOpenModal } = useModal();

  const onSelectProfessionalUser = () =>
    onStackOpenModal(ModalEnum.PROFESSIONAL_SELECT, {
      title:
        'Selecione os profissionais responsaveis pela elaboração do documento',
      onSelect: (user: SelectUserProfessional | SelectUserProfessional[]) => {
        if (Array.isArray(user)) {
          return onAdd('', user);
        }

        onAdd(String(user.id), user);
      },
      multiple,
      selected: values,
    } as typeof initialUsersSelectState);

  return {
    onSelectProfessionalUser,
  };
};
