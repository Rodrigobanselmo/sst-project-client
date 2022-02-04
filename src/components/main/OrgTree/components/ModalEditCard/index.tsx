import React from 'react';

import SModal, {
  SModalPaper,
  SModalHeader,
  SModalButtons,
} from '../../../../../components/molecules/SModal';
import { ModalEnum } from '../../../../../core/enums/modal.enums';
import { useRegisterModal } from '../../../../../core/hooks/useRegisterModal';
import { IModalButton } from '../../../../molecules/SModal/components/SModalButtons/types';

export const ModalEditCard = () => {
  const { registerModal } = useRegisterModal();

  const modalButton = [
    {},
    {
      text: 'Savar',
      onClick: () => console.log(9),
    },
  ] as IModalButton[];

  return (
    <SModal {...registerModal(ModalEnum.TREE_CARD)}>
      <SModalPaper>
        <SModalHeader modalName={ModalEnum.TREE_CARD} title="TREE_CARD" />
        12311231123112311231123112311231123112311231 1231 1231 1231 1231 1231
        1231 1231 1231 1231 1231 1231 1231 1231 1231 1231 1231 1231
        <SModalButtons modalName={ModalEnum.TREE_CARD} buttons={modalButton} />
      </SModalPaper>
    </SModal>
  );
};
