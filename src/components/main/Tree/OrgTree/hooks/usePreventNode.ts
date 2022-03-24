import { QuestionOptionsEnum } from 'components/main/Tree/ChecklistTree/enums/question-options.enums';
import { IModalDataSlice } from 'store/reducers/modal/modalSlice';

import { useGlobalModal } from 'core/hooks/useGlobalModal';

import { ITreeMapObject, ITreeSelectedItem } from '../interfaces';

export const usePreventNode = () => {
  const { onOpenGlobalModal } = useGlobalModal();

  const preventMultipleTextOptions = (
    node: ITreeMapObject | ITreeSelectedItem,
    type?: QuestionOptionsEnum,
  ) => {
    return false;
  };

  const preventChangeCardType = (node: ITreeMapObject | ITreeSelectedItem) => {
    if (node.childrenIds.length > 0) {
      const data = {
        title: 'Ação bloqueada',
        text: 'Você só poderá mudar o tipo de cartão quando não houver nenhum cartão descendente ligado a este.',
        confirmText: 'Ok',
        tag: 'warning',
      } as IModalDataSlice;

      onOpenGlobalModal(data);
      return true;
    }
    return false;
  };

  const preventDelete = (callback: () => void) => {
    const data = {
      title: 'Você tem certeza?',
      text: 'Ao remover esse item, você também removerá todos os items decendentes dele.',
      confirmText: 'Deletar',
      tag: 'delete',
      confirmCancel: 'Cancel',
    } as IModalDataSlice;

    onOpenGlobalModal(data, callback);
  };

  return { preventMultipleTextOptions, preventChangeCardType, preventDelete };
};
