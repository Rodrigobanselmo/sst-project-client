import { ReactNode } from 'react';

import { QuestionOptionsEnum } from 'components/organisms/main/Tree/ChecklistTree/enums/question-options.enums';
import { IModalDataSlice } from 'store/reducers/modal/modalSlice';

import { useGlobalModal } from 'core/hooks/useGlobalModal';

import { questionsTextTypesConstant } from '../constants/questions-text-types.constant';
import { ITreeMapObject, ITreeSelectedItem } from '../interfaces';

export const usePreventNode = () => {
  const { onOpenGlobalModal } = useGlobalModal();

  const preventMultipleTextOptions = (
    node: ITreeMapObject | ITreeSelectedItem,
    type?: QuestionOptionsEnum,
  ) => {
    const answerType = type ? type : node?.answerType;

    if (
      answerType &&
      questionsTextTypesConstant.includes(answerType) &&
      node.childrenIds.length > (type ? 1 : 0)
    ) {
      const text = type
        ? 'Você possui mais de uma opção ligada a este cartão, para prosseguir com essa ação é necessario possuir no maximo uma opção de resposta.'
        : 'Esta pergunta está aceitando respostas em texto! Perguntas com resposta em texto somente permitem um único cartão ligado a ela.';

      const data = {
        title: 'Ação bloqueada',
        text,
        confirmText: 'Ok',
        tag: 'warning',
      } as IModalDataSlice;

      onOpenGlobalModal(data);
      return true;
    }
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

  const preventDelete = (
    callback: () => void,
    message?: ReactNode,
    options: Partial<IModalDataSlice> = {} as IModalDataSlice,
  ) => {
    const data = {
      title: 'Você tem certeza?',
      text:
        message ||
        'Ao remover esse item, você também removerá todos os items decendentes dele.',
      confirmText: 'Deletar',
      tag: 'delete',
      confirmCancel: 'Cancel',
      ...options,
    } as IModalDataSlice;

    onOpenGlobalModal(data, callback);
  };

  return { preventMultipleTextOptions, preventChangeCardType, preventDelete };
};
