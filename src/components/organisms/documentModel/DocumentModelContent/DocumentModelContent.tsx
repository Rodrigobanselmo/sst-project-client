import React, { cloneElement } from 'react';

import { LinearProgress } from '@mui/material';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

import { useContentDocumentModel } from './hooks/useContentDocumentModel';
import { STStructContainer } from './styles';
import { TypeSectionItem } from './TypeSectionItem/TypeSectionItem';

export const DocumentModelContent: React.FC<
  { children?: any } & {
    model: IDocumentModelFull | undefined;
    companyId?: string;
    loading?: boolean;
  }
> = ({ companyId, children, ...props }) => {
  const { data, variables, elements, sections, handleDeleteActualItems } =
    useContentDocumentModel(props);

  return (
    <>
      {children && cloneElement(children as any, { handleDeleteActualItems })}
      <STStructContainer className="documentModelContainer">
        {props.loading && <LinearProgress />}

        {data && variables && elements && sections && (
          <TypeSectionItem
            data={data}
            variables={variables}
            elements={elements}
            sections={sections}
            companyId={companyId}
          />
        )}
      </STStructContainer>
    </>
  );
};
