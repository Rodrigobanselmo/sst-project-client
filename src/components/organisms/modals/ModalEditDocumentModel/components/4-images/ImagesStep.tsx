/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { documentModelTableStepSurfaceSx } from 'components/organisms/tables/DocumentModelTable/document-model-presentation-theme';
import { ImageGalleryTable } from 'components/organisms/tables/ImageGalleryTable/ImageGalleryTable';
import { ImagesTypeEnum } from 'project/enum/imageGallery.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import { IUseDocumentModel } from '../../hooks/useEditDocumentModel';
import { useDataStep } from './hooks/useDataStep';

export const ImagesStep = (data: IUseDocumentModel) => {
  const props = useDataStep(data);
  const { loading, onCloseUnsaved, onSubmit } = props;

  const buttons = [
    {
      disabled: data.isPersisting,
    },
    {
      text: 'Salvar',
      variant: 'contained',
      onClick: () => onSubmit(),
      disabled: data.isPersisting,
    },
  ] as IModalButton[];

  const types = [ImagesTypeEnum.DOCS, ImagesTypeEnum.OTHERS];
  if (DocumentTypeEnum.PGR == props.data.type) types.push(ImagesTypeEnum.PGR);
  else if (DocumentTypeEnum.PCSMO == props.data.type)
    types.push(ImagesTypeEnum.PCMSO);
  else if (DocumentTypeEnum.OTHER == props.data.type)
    types.push(ImagesTypeEnum.OTHERS);

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box sx={documentModelTableStepSurfaceSx}>
          <ImageGalleryTable
            searchTypes={types}
            createTypes={[types.at(-1) as ImagesTypeEnum]}
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
