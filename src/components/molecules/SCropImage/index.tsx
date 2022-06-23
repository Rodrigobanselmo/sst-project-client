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

import { canvasPreview } from './utils/canvasPreview';
import { centerAspectCrop } from './utils/centerAspectCrop';

interface SCropImageProps {
  files?: File[];
  freeAspect?: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onSelect?: (crop: PixelCrop) => void;
}

export default function SCropImage({
  files,
  freeAspect,
  onSelect,
  canvasRef,
}: SCropImageProps) {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);

  const readImageFile = (imageBlob: Blob) => {
    setCrop(undefined); // Makes crop preview update between images.
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (reader.result) setImgSrc(reader.result.toString() || '');
    });
    reader.readAsDataURL(imageBlob);
  };

  useEffect(() => {
    if (files && files?.length > 0) {
      readImageFile(files[0]);
    }
  }, [files]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    let aspectRatio = aspect;
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      if (width >= height) {
        setAspect(16 / 9);
        aspectRatio = 16 / 9;
      }
      if (height > width) {
        setAspect(9 / 16);
        aspectRatio = 9 / 16;
      }

      // const isHeightBiggerThan600 = height > 600;
      // const newWidth = isHeightBiggerThan600?: width;

      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  }

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else if (imgRef.current) {
      const { width, height } = imgRef.current;
      console.log(height, width);
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
    completedCrop && onSelect && onSelect(completedCrop);
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      canvasRef.current
    ) {
      // We use canvasPreview as it's much faster than imgPreview.
      canvasPreview(
        imgRef.current,
        canvasRef.current,
        completedCrop,
        scale,
        rotate,
      );
    }
  };

  return (
    <div className="App">
      <div className="Crop-Controls">
        <SFlex mb={10}>
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
          />
          <STagButton
            large
            text="Cortar Imagem"
            icon={SDeleteIcon}
            sx={{ '*': { color: 'white !important' }, ml: 'auto' }}
            iconProps={{ sx: { fontSize: 15 } }}
            bg="success.main"
            onClick={handleCropImage}
          />
        </SFlex>
        {freeAspect && (
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
            maxHeight: 520,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: defaultTheme.palette.grey[200],
            marginBottom: '10px',
          }}
        >
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            style={{ maxHeight: 520 }}
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
    </div>
  );
}
