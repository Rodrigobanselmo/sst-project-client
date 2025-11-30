/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';

import { DocumentTypeEnum } from 'project/enum/document.enums';

import { IUseMainActionsModal, useMainActions } from './useMainActions';

export const initialLTCATDocState = {
  json: {},
};

export const useLTCATHandleModal = () => {
  const props = useMainActions({
    type: DocumentTypeEnum.LTCAT,
    initialDocState: initialLTCATDocState,
  });

  const {
    registerModal,
    onCloseUnsaved,
    onClose,
    data,
    setData,
    modalName,
    initialDataRef,
    docLoading,
    getModalData,
    doc,
    initialState,
  } = props;

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setData((oldData) => {
        const newData = {
          ...initialState,
          ...oldData,
          ...initialData,
          ...doc,
          json: {
            ...initialState.json,
            ...oldData.json,
            ...initialData?.json,
            ...doc?.json,
          },
          type: DocumentTypeEnum.LTCAT,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData, doc, onClose, setData]);

  return {
    registerModal,
    onCloseUnsaved,
    onClose,
    data,
    setData,
    modalName,
    initialDataRef,
    docLoading,
    props: props as unknown as IUseMainActionsModal,
  };
};

export type IUseLTCATHandleModal = ReturnType<typeof useLTCATHandleModal>;
