/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';

import { DocumentTypeEnum } from 'project/enum/document.enums';

import { useMainActions, IUseMainActionsModal } from './useMainActions';

export const initialFRPSDocState = {
  json: {},
};

export const useFRPSHandleModal = () => {
  const props = useMainActions({
    type: DocumentTypeEnum.FRPS,
    initialDocState: initialFRPSDocState,
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
          type: DocumentTypeEnum.FRPS,
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

export type IUseFRPSHandleModal = ReturnType<typeof useFRPSHandleModal>;
