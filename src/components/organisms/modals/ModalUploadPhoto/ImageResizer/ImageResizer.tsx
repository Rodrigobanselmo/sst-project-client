import React, { FC, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PixelCrop } from 'react-image-crop';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { styled } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import { InputForm } from 'components/molecules/form/input';
import SCropImage from 'components/molecules/SCropImage';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { useSnackbar } from 'notistack';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { photoSchema } from 'core/utils/schemas/photo.schema';

import { SFileDndUpload } from '../../../../molecules/SFileDndUpload';
import { SModalUploadPhoto } from '../types';
import { calculateDimensionsWithMaxSize } from 'core/utils/helpers/calculateDimensionsWithMaxSize';

const StyledImage = styled('img')`
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
  border-radius: 8px;
  object-fit: contain;
`;

export const ImageResizer: FC<{
  url: string;
  maxWidth: number;
  maxHeight: number;
}> = ({ url, maxHeight = 400, maxWidth = 800 }) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const { height, width } = calculateDimensionsWithMaxSize({
        width: img.width,
        height: img.height,
        maxWidth,
        maxHeight,
      });
      const size = {
        width,
        height,
      };
      setImageSize(size);
    };
    img.onerror = (error) => {
      console.error('Error loading image:', error);
    };
    img.src = url;
  }, [url, maxHeight, maxWidth]);

  return (
    <div>
      <StyledImage
        src={url}
        width={imageSize.width}
        height={imageSize.height}
        alt="Image"
      />
    </div>
  );
};
