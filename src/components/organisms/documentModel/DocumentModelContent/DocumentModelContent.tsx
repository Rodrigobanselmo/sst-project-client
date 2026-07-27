import React, { cloneElement, useMemo } from 'react';

import { LinearProgress } from '@mui/material';
import { selectAllDocumentModel } from 'store/reducers/document/documentSlice';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { buildDocumentHeadingNumbering } from '../utils/buildDocumentHeadingNumbering';
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

  const documentModel = useAppSelector(selectAllDocumentModel);

  const headingNumbering = useMemo(
    () =>
      buildDocumentHeadingNumbering(
        documentModel?.sections ?? props.model?.document?.sections,
      ),
    [documentModel?.sections, props.model?.document?.sections],
  );

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
            headingNumbering={headingNumbering}
          />
        )}
      </STStructContainer>
    </>
  );
};
