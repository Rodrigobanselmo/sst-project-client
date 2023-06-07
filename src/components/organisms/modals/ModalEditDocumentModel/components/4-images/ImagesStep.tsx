/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import clone from 'clone';
import { SPageMenu } from 'components/molecules/SPageMenu';
import { VariablesDocTable } from 'components/organisms/tables/VariablesDocTable/VariablesDocTable';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { selectAllDocumentModelVariables } from 'store/reducers/document/documentSlice';
import { IUseDocumentModel } from '../../hooks/useEditDocumentModel';
import { useDataStep } from './hooks/useDataStep';
import { ImageGalleryTable } from 'components/organisms/tables/ImageGalleryTable/ImageGalleryTable';
import { ImagesTypeEnum } from 'project/enum/imageGallery.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';

export const ImagesStep = (data: IUseDocumentModel) => {
  const props = useDataStep(data);
  const { loading, onCloseUnsaved, onSubmit } = props;

  const buttons = [
    {},
    {
      text: 'Salvar',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  const types = [ImagesTypeEnum.DOCS];
  if (DocumentTypeEnum.PGR == props.data.type) types.push(ImagesTypeEnum.PGR);
  else if (DocumentTypeEnum.PCSMO == props.data.type)
    types.push(ImagesTypeEnum.PCMSO);
  else if (DocumentTypeEnum.OTHER == props.data.type)
    types.push(ImagesTypeEnum.OTHERS);

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box>
          <ImageGalleryTable
            types={types}
            companyId={data.data?.companyId}
            hideTitle
          />
        </Box>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </SFlex>
  );
};
