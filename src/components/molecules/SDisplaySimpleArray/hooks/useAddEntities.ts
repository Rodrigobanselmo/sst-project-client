import { initialContactModalState } from 'components/organisms/modals/ModalAddContactx';
import { initialUsersSelectState } from 'components/organisms/modals/ModalSelectUsers';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IContact } from 'core/interfaces/api/IContact';
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

  const onSelectContacts = () =>
    onStackOpenModal(ModalEnum.CONTACT_ADD, {
      onConfirm: (contact) => {
        if (Array.isArray(contact)) {
          return onAdd('', contact);
        }

        onAdd(String(contact.id), contact);
      },
    } as typeof initialContactModalState);

  const onEditSelectContacts = (
    data: Partial<typeof initialContactModalState>,
  ) =>
    onStackOpenModal(ModalEnum.CONTACT_ADD, {
      ...data,
    } as typeof initialContactModalState);

  return {
    onSelectProfessionalUser,
    onSelectContacts,
    onEditSelectContacts,
  };
};
