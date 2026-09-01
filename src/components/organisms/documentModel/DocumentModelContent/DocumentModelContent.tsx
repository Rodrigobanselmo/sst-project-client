import React, { cloneElement, useMemo } from 'react';

import { Box, LinearProgress } from '@mui/material';
import { documentModelClassicSheetSx } from 'components/organisms/tables/DocumentModelTable/document-model-presentation-theme';
import { selectAllDocumentModel } from 'store/reducers/document/documentSlice';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { DocumentModelEditorBoundary } from '../editor-v2/integration/DocumentModelEditorBoundary';
import { buildDocumentHeadingNumbering } from '../utils/buildDocumentHeadingNumbering';
import { DocumentModelPrintTheme } from './DocumentModelPrintTheme';
import { useContentDocumentModel } from './hooks/useContentDocumentModel';
import { STStructContainer } from './styles';
import { TypeSectionItem } from './TypeSectionItem/TypeSectionItem';

function ClassicDocumentSheet({ children }: { children: React.ReactNode }) {
  return (
    <DocumentModelPrintTheme>
      <Box
        className="document-model-classic-sheet"
        sx={documentModelClassicSheetSx}
      >
        {children}
      </Box>
    </DocumentModelPrintTheme>
  );
}

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
          <DocumentModelEditorBoundary
            model={props.model}
            headingNumbering={headingNumbering}
            v1={
              <ClassicDocumentSheet>
                <TypeSectionItem
                  data={data}
                  variables={variables}
                  elements={elements}
                  sections={sections}
                  companyId={companyId}
                  headingNumbering={headingNumbering}
                />
              </ClassicDocumentSheet>
            }
          />
        )}
      </STStructContainer>
    </>
  );
};
