import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type CharacterizationInlineEditorContextValue = {
  isInlineEditOpen: boolean;
  setInlineEditOpen: (open: boolean) => void;
};

const CharacterizationInlineEditorContext =
  createContext<CharacterizationInlineEditorContextValue | null>(null);

export const CharacterizationInlineEditorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isInlineEditOpen, setInlineEditOpenState] = useState(false);

  const setInlineEditOpen = useCallback((open: boolean) => {
    setInlineEditOpenState(open);
  }, []);

  const value = useMemo(
    () => ({ isInlineEditOpen, setInlineEditOpen }),
    [isInlineEditOpen, setInlineEditOpen],
  );

  return (
    <CharacterizationInlineEditorContext.Provider value={value}>
      {children}
    </CharacterizationInlineEditorContext.Provider>
  );
};

export const useCharacterizationInlineEditor = () => {
  const context = useContext(CharacterizationInlineEditorContext);
  if (!context) {
    throw new Error(
      'useCharacterizationInlineEditor must be used within CharacterizationInlineEditorProvider',
    );
  }
  return context;
};

export const useCharacterizationInlineEditorOptional = () =>
  useContext(CharacterizationInlineEditorContext);
