import { Box } from '@mui/material';
import { ActionPlanReadPhotoModel } from '@v2/models/security/models/action-plan/action-plan-read-photo.model';
import Image from 'next/image';
import ExpandIcon from '@mui/icons-material/Expand';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import ScrollContainer from 'react-indiana-drag-scroll';
import DeleteOutlineIcon from 'assets/icons/SDeleteIcon';
import dynamic from 'next/dynamic';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';

const ActionPlanGalleryModalDynamic = dynamic(
  async () => {
    const mod = await import('./ActionPlanGalleryModal');
    return mod.ActionPlanGalleryModal;
  },
  { ssr: false },
);

export const ActionPlanSliderPhotos = ({
  photos,
  onDelete,
  isLoadingDelete,
  isFullScreen,
}: {
  photos: ActionPlanReadPhotoModel[];
  isFullScreen?: boolean;
  onDelete?: (photo: ActionPlanReadPhotoModel) => void;
  isLoadingDelete?: boolean;
}) => {
  const { openModal } = useModal();

  const handleDelete = (photo: ActionPlanReadPhotoModel) => {
    onDelete?.(photo);
  };

  const handleOpenGallery = async (photo: ActionPlanReadPhotoModel) => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_VIEW_PHOTO_GALLERY,
      <ActionPlanGalleryModalDynamic startPhotoId={photo.id} photos={photos} />,
    );
  };

  return (
    <ScrollContainer horizontal={true} vertical={false} hideScrollbars={true}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {photos.map((photo, index) => {
          let photoWidth =
            photos.length <= 1
              ? ['100%', '100%', '400px']
              : ['90%', '90%', '400px'];

          if (photo.isVertical) {
            photoWidth = ['165px'];
          }

          return (
            <Box
              key={photo.id}
              id={photo.id}
              sx={{
                position: 'relative',
                minWidth: photoWidth,
                height: isFullScreen ? '80vh' : '300px',
                marginRight: '10px',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Blurred Background Image */}
              <Image
                src={photo.url}
                alt={`Blurred background for characterization photo ${
                  index + 1
                }`}
                fill
                style={{
                  objectFit: 'cover',
                  filter: 'blur(10px)',
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
              {/* Expand Button */}
              <SIconButton
                onClick={() => handleOpenGallery(photo)}
                iconButtonProps={{
                  sx: {
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    },
                  },
                }}
              >
                <ExpandIcon />
              </SIconButton>
              {!!onDelete && (
                <SIconButton
                  onClick={() => handleDelete(photo)}
                  loading={isLoadingDelete}
                  iconButtonProps={{
                    sx: {
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      bgcolor: 'rgba(130, 13, 13, 0.621)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(203, 23, 23, 0.732)',
                      },
                    },
                  }}
                >
                  <DeleteOutlineIcon />
                </SIconButton>
              )}
            </Box>
          );
        })}
      </Box>
    </ScrollContainer>
  );
};
