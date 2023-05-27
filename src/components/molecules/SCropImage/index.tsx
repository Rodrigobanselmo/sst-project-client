/* eslint-disable @next/next/no-img-element */
import 'react-image-crop/dist/ReactCrop.css';

import React, { useEffect, useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';

import defaultTheme from 'configs/theme';

import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import SRotate90Icon from 'assets/icons/SRotate90Icon';
import { SRotateLeftIcon } from 'assets/icons/SRotateLeftIcon';
import { SRotateRightIcon } from 'assets/icons/SRotateRightIcon';
import SZooInIcon from 'assets/icons/SZooInIcon';
import SZooOutIcon from 'assets/icons/SZooOutIcon';

import { IdsEnum } from 'core/enums/ids.enums';

import { canvasPreview } from './utils/canvasPreview';
import { centerAspectCrop } from './utils/centerAspectCrop';
import { useSnackbar } from 'notistack';
import { simulateAwait } from 'core/utils/helpers/simulateAwait';

interface SCropImageProps {
  file?: File;
  freeAspect?: boolean;
  canCancel?: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onSelect?: (options: { dataUrl?: string; crop?: PixelCrop }) => void;
  maxHeight?: number;
}

export default function SCropImage({
  file,
  freeAspect,
  onSelect,
  maxHeight = 520,
  canvasRef,
  canCancel,
}: SCropImageProps) {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const { enqueueSnackbar } = useSnackbar();

  const readImageFile = (imageBlob: Blob) => {
    setCrop(undefined); // Makes crop preview update between images.
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (reader.result) setImgSrc(reader.result.toString() || '');
    });
    reader.readAsDataURL(imageBlob);
  };

  useEffect(() => {
    if (file) {
      readImageFile(file);
    }
  }, [file]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    let aspectRatio = aspect;
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      if (width >= height) {
        if (!freeAspect) setAspect(16 / 9);
        aspectRatio = 16 / 9;
      }
      if (height > width) {
        if (!freeAspect) setAspect(9 / 16);
        aspectRatio = 9 / 16;
      }

      if (freeAspect) {
        setAspect(undefined);
      }

      setCrop(
        centerAspectCrop(
          width,
          height,
          freeAspect ? width / height : aspectRatio,
        ),
      );
    }
  }

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (width >= height) {
        setAspect(16 / 9);
        setCrop(centerAspectCrop(width, height, 16 / 9));
      }
      if (height > width) {
        setAspect(9 / 16);
        setCrop(centerAspectCrop(width, height, 9 / 16));
      }
    }
  }

  const handleCropImage = () => {
    const crop: typeof completedCrop = { ...completedCrop } as any;
    const isCropToSmall =
      !completedCrop?.height ||
      !completedCrop?.width ||
      completedCrop?.height < 50 ||
      completedCrop?.width < 50;

    if (isCropToSmall && crop) {
      enqueueSnackbar('Selecione uma área maior para recortar a imagem.', {
        variant: 'error',
      });
      return;
    }

    if (crop?.width && crop?.height && imgRef.current && canvasRef.current) {
      canvasPreview(imgRef.current, canvasRef.current, crop, scale, rotate);
    }

    onSelect?.({ dataUrl: canvasRef.current?.toDataURL(), crop });
  };

  const handleCancelCropImage = () => {
    const crop: typeof completedCrop = { ...completedCrop } as any;

    if (crop) {
      crop.x = 0;
      crop.y = 0;
      crop.height = imgRef.current?.height || 0;
      crop.width = imgRef.current?.width || 0;
    }

    if (crop?.width && crop?.height && imgRef.current && canvasRef.current) {
      canvasPreview(imgRef.current, canvasRef.current, crop, scale, rotate);
    }

    onSelect?.({ crop });
  };

  return (
    <div className="App">
      <div className="Crop-Controls">
        <SFlex mb={5}>
          <STagButton
            large
            icon={SZooInIcon}
            text="Ampliar"
            iconProps={{ sx: { fontSize: 17 } }}
            onClick={() => setScale(scale + 0.1)}
          />
          <STagButton
            large
            icon={SZooOutIcon}
            text="Reduzir"
            iconProps={{ sx: { fontSize: 17 } }}
            onClick={() => setScale(scale - 0.1)}
          />
          <STagButton
            tooltipTitle="Rotacionar anti-horário"
            large
            icon={SRotateLeftIcon}
            text=""
            iconProps={{ sx: { fontSize: 17 } }}
            onClick={() => setRotate(Number(rotate - 1))}
          />
          <STagButton
            large
            tooltipTitle="Rotacionar 90° graus"
            icon={SRotate90Icon}
            text=""
            iconProps={{ sx: { fontSize: 17 } }}
            onClick={() => setRotate(Number(rotate + 90))}
          />
          <STagButton
            tooltipTitle="Rotacionar sentido horário"
            large
            icon={SRotateRightIcon}
            iconProps={{ sx: { fontSize: 17 } }}
            onClick={() => setRotate(Number(rotate + 1))}
            mr={20}
          />
        </SFlex>
        {false && (
          <div>
            <button onClick={handleToggleAspectClick}>
              Toggle aspect {aspect ? 'off' : 'on'}
            </button>
          </div>
        )}
      </div>
      {Boolean(imgSrc) && (
        <div
          style={{
            maxHeight: maxHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: defaultTheme.palette.grey[200],
            marginBottom: '10px',
            border: '1px solid #ddd',
          }}
        >
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => {
              setCrop(percentCrop);
            }}
            onComplete={(c) => {
              setCompletedCrop(c);
            }}
            aspect={aspect}
            style={{ maxHeight: maxHeight }}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imgSrc}
              onLoad={onImageLoad}
              style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            />
          </ReactCrop>
        </div>
      )}
      <SFlex ml="auto" justifyContent={'end'} mb={5}>
        {canCancel && (
          <STagButton
            text="Cancelar"
            sx={{
              '*': { color: '#F44336 !important' },
              // ml: 'auto'
            }}
            iconProps={{ sx: { fontSize: 15 } }}
            error
            outline
            onClick={handleCancelCropImage}
          />
        )}
        <STagButton
          text="Cortar Imagem"
          // icon={SDeleteIcon} //!
          sx={{ '*': { color: 'white !important' } }}
          iconProps={{ sx: { fontSize: 15 } }}
          bg="success.main"
          onClick={handleCropImage}
          id={IdsEnum.CROP_IMAGE_BUTTON}
        />
      </SFlex>
    </div>
  );
}
