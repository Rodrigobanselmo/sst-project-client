/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { DocumentModelContent } from 'components/organisms/documentModel/DocumentModelContent/DocumentModelContent';
import { DocumentModelTree } from 'components/organisms/documentModel/DocumentModelTree/DocumentModelTree';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseDocumentModel } from '../../hooks/useEditDocumentModel';
import { SearchIndex } from './components/SearchIndex/SearchIndex';
import { TopButtons } from './components/TopButtons/TopButtons';
import { useViewDocumentModel } from './hooks/useViewDocumentModel';
import { STRelativeBox } from './styles';

export const ViewDocumentModelStep = (dataProps: IUseDocumentModel) => {
  const props = useViewDocumentModel(dataProps);
  const { loading, model } = props;

  return (
    <SFlex
      direction="column"
      justify="space-between"
      flex={1}
      position="relative"
    >
      <AnimatedStep>
        <Box
          position={'absolute'}
          sx={{
            display: 'flex',
            gap: 10,
            width: '100%',
            height: '100%',
          }}
        >
          <STRelativeBox nav={1}>
            <SearchIndex {...props} />
            <Box width={'100%'} position={'absolute'}>
              <DocumentModelTree model={model} loading={loading} />
            </Box>
          </STRelativeBox>
          <STRelativeBox>
            <Box width={'100%'} position={'absolute'}>
              <DocumentModelContent model={model} loading={loading}>
                <TopButtons {...props} />
              </DocumentModelContent>
            </Box>
          </STRelativeBox>
        </Box>
      </AnimatedStep>
    </SFlex>
  );
};
