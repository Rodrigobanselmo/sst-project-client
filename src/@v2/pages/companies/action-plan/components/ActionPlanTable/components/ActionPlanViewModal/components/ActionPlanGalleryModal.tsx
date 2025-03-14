import { Box } from '@mui/material';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import { ActionPlanReadPhotoModel } from '@v2/models/security/models/action-plan/action-plan-read-photo.model';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export const ActionPlanGalleryModal = ({
  photos,
  startPhotoId,
}: {
  photos: ActionPlanReadPhotoModel[];
  startPhotoId?: string;
}) => {
  const title = 'Galeria de Fotos';
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleImageClick = (photo: ActionPlanReadPhotoModel) => {
    window.open(photo.url, '_blank');
  };

  useEffect(() => {
    if (startPhotoId) {
      const element = document.getElementById(startPhotoId);
      if (element && containerRef.current) {
        containerRef.current.scrollTo({
          top: element.offsetTop - containerRef.current.offsetTop - 35,
          behavior: 'smooth',
        });
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [startPhotoId]);

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
        {photos.map((photo, index) => (
          <Box
            onClick={() => handleImageClick(photo)}
            key={photo.id}
            id={photo.id}
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
              src={photo.url}
              alt={`Blurred background for characterization photo ${index + 1}`}
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
              src={photo.url}
              alt={`Characterization photo ${index + 1}`}
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
