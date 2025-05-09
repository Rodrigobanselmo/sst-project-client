/* eslint-disable @next/next/no-img-element */
import { Box } from '@mui/material';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface Props {
  images: { id: string | number; url: string }[];
  startImageId?: string | number;
  title?: string;
}

export const ImageGalleryModal = ({
  images,
  startImageId,
  title = 'Galeria de Fotos',
}: Props) => {
  const scrollImageId = startImageId + '-image-id';
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleImageClick = (photo: Props['images'][0]) => {
    window.open(photo.url, '_blank');
  };

  useEffect(() => {
    if (scrollImageId) {
      const element = document.getElementById(scrollImageId);
      if (element && containerRef.current) {
        containerRef.current.scrollTo({
          top: element.offsetTop - containerRef.current.offsetTop - 35,
          behavior: 'smooth',
        });
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startImageId]);

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.ACTION_PLAN_VIEW_PHOTO_GALLERY}
      title={title}
      semiFullScreen
      closeButtonOptions={{
        text: 'Fechar',
      }}
    >
      <Box sx={{ overflow: 'scroll' }} ref={containerRef}>
        {images.map((image, index) => (
          <Box
            onClick={() => handleImageClick(image)}
            key={image.id.toString()}
            id={image.id.toString() + '-image-id'}
            sx={{
              position: 'relative',
              minWidth: '100%',
              height: '70vh',
              marginRight: '10px',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 8,
              cursor: 'pointer',
            }}
          >
            {/* Blurred Background Image */}
            <img
              src={image.url}
              alt={`Blurred background for image ${index + 1}`}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                objectFit: 'cover',
                filter: 'blur(10px)',
              }}
              loading={index === 0 ? 'eager' : 'lazy'}
            />

            {/* Foreground Image */}
            <img
              src={image.url}
              alt={`Image ${index + 1}`}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                objectFit: 'contain',
              }}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </Box>
        ))}
      </Box>
    </SModalWrapper>
  );
};
