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
            <Image
              src={image.url}
              alt={`Blurred background for Image ${index + 1}`}
              fill
              style={{
                objectFit: 'cover',
                filter: 'blur(100px)',
                borderRadius: 2,
              }}
              priority={index === 0}
            />
            {/* Foreground Image */}
            <Image
              src={image.url}
              alt={`Image ${index + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              priority={index === 0}
            />
          </Box>
        ))}
      </Box>
    </SModalWrapper>
  );
};
