/* eslint-disable @typescript-eslint/no-explicit-any */

import SModal from 'components/molecules/SModal';

import { ModalEnum } from 'core/enums/modal.enums';

import { useAddUser } from './hooks/useAddUser';
import { ModalAddUsersComponent } from './ModalAddUsersComponent';

export const ModalAddUsers = () => {
  const props = useAddUser();

  return (
    <SModal
      {...props.registerModal(ModalEnum.USER_ADD)}
      keepMounted={false}
      onClose={props.onCloseUnsaved}
    >
      <ModalAddUsersComponent {...props} />
    </SModal>
  );
};
