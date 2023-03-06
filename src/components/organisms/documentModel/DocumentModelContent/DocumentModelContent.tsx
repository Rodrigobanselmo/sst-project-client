import React from 'react';

import { LinearProgress } from '@mui/material';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import { useContentDocumentModel } from './hooks/useContentDocumentModel';
import { STStructContainer } from './styles';
import { TypeSectionItem } from './TypeSectionItem/TypeSectionItem';

export function DocumentModelContent(props: {
  model: IDocumentModelFull | undefined;
  loading?: boolean;
}) {
  const { data, variables, elements, sections } =
    useContentDocumentModel(props);
  // const dispatch = useAppDispatch();

  // const handleSelect = (node: NodeDocumentModel) =>
  //   dispatch(setDocumentSelectItem(node));

  return (
    <STStructContainer className="documentModelContainer">
      {props.loading && <LinearProgress />}

      {data && variables && elements && sections && (
        <TypeSectionItem
          data={data}
          variables={variables}
          elements={elements}
          sections={sections}
        />
      )}
    </STStructContainer>
  );
}
