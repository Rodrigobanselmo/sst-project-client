import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { Editor } from '@tiptap/react';

type DocumentEditorV2HostValue = {
  editor: Editor | null;
  revision: number;
  registerEditor: (editor: Editor | null) => void;
  notifyEditorActivity: () => void;
};

const DocumentEditorV2HostContext = createContext<DocumentEditorV2HostValue>({
  editor: null,
  revision: 0,
  registerEditor: () => undefined,
  notifyEditorActivity: () => undefined,
});

export function useDocumentEditorV2Host(): DocumentEditorV2HostValue {
  return useContext(DocumentEditorV2HostContext);
}

export function DocumentEditorV2HostProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [revision, setRevision] = useState(0);

  const registerEditor = useCallback((next: Editor | null) => {
    setEditor(next);
  }, []);

  const notifyEditorActivity = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({
      editor,
      revision,
      registerEditor,
      notifyEditorActivity,
    }),
    [editor, notifyEditorActivity, registerEditor, revision],
  );

  return (
    <DocumentEditorV2HostContext.Provider value={value}>
      {children}
    </DocumentEditorV2HostContext.Provider>
  );
}
