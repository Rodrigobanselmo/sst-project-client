/* eslint-disable @next/next/no-img-element */
import { Box } from '@mui/material';
import { ActionPlanReadPhotoModel } from '@v2/models/security/models/action-plan/action-plan-read-photo.model';
import Image from 'next/image';
import ExpandIcon from '@mui/icons-material/Expand';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import ScrollContainer from 'react-indiana-drag-scroll';
import DeleteOutlineIcon from 'assets/icons/SDeleteIcon';
import dynamic from 'next/dynamic';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const ImageGalleryModalDynamic = dynamic(
  async () => {
    const mod = await import(
      '../../../../../../../../components/organisms/SModal/implementations/ImageGalleryModal/ImageGalleryModal'
    );
    return mod.ImageGalleryModal;
  },
  { ssr: false },
);

export const ActionPlanSliderPhotos = ({
  photos,
  onDelete,
  onChangeVisibility,
  isLoadingDelete,
  isFullScreen,
  isLoadingChangeVisibility,
  showInvisible,
}: {
  photos: ActionPlanReadPhotoModel[];
  isFullScreen?: boolean;
  showInvisible?: boolean;
  onDelete?: (photo: ActionPlanReadPhotoModel) => void;
  onChangeVisibility?: (photo: ActionPlanReadPhotoModel) => void;
  isLoadingDelete?: boolean;
  isLoadingChangeVisibility?: boolean;
}) => {
  const { openModal } = useModal();

  const handleDelete = (photo: ActionPlanReadPhotoModel) => {
    onDelete?.(photo);
  };

  const handleChangeVisibility = (photo: ActionPlanReadPhotoModel) => {
    onChangeVisibility?.(photo);
  };

  const handleOpenGallery = async (photo: ActionPlanReadPhotoModel) => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_VIEW_PHOTO_GALLERY,
      <ImageGalleryModalDynamic startImageId={photo.id} images={photos} />,
    );
  };

  return (
    <ScrollContainer horizontal={true} vertical={false} hideScrollbars={true}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {photos.map((photo, index) => {
          const random = Math.random().toString();
          if (!showInvisible && !photo.isVisible) {
            return null;
          }

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
              <img
                src={photo.url + `?timestamp=${photo.updatedAt}`}
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
                src={photo.url + `?timestamp=${photo.updatedAt}`}
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
              {!!onChangeVisibility && (
                <SIconButton
                  onClick={() => handleChangeVisibility(photo)}
                  loading={isLoadingChangeVisibility}
                  iconButtonProps={{
                    sx: {
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      bgcolor: photo.isVisible
                        ? 'rgba(32, 109, 22, 0.621)'
                        : 'rgba(130, 13, 13, 0.621)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: photo.isVisible
                          ? 'rgba(23, 119, 35, 0.621)'
                          : 'rgba(203, 23, 23, 0.732)',
                      },
                    },
                  }}
                >
                  {photo.isVisible ? (
                    <VisibilityOutlinedIcon />
                  ) : (
                    <VisibilityOffOutlinedIcon />
                  )}
                </SIconButton>
              )}
            </Box>
          );
        })}
      </Box>
    </ScrollContainer>
  );
};
