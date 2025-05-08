import ExpandIcon from '@mui/icons-material/Expand';
import { Box } from '@mui/material';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { TaskReadModel } from '@v2/models/tasks/models/task/task-read.model';
import DeleteOutlineIcon from 'assets/icons/SDeleteIcon';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import ScrollContainer from 'react-indiana-drag-scroll';

const ImageGalleryModalDynamic = dynamic(
  async () => {
    const mod = await import(
      '../../../../../../../../SModal/implementations/ImageGalleryModal/ImageGalleryModal'
    );
    return mod.ImageGalleryModal;
  },
  { ssr: false },
);

export const TaskSliderPhotos = ({
  task,
  onDelete,
  isLoadingDelete,
  isFullScreen,
}: {
  task: TaskReadModel;
  onDelete?: (photo: TaskReadModel['photos'][0]) => void;
  isLoadingDelete?: boolean;
  isFullScreen?: boolean;
}) => {
  const { openModal } = useModal();

  const handleDelete = (photo: TaskReadModel['photos'][0]) => {
    onDelete?.(photo);
  };

  const handleOpenGallery = async (photo: TaskReadModel['photos'][0]) => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_VIEW_PHOTO_GALLERY,
      <ImageGalleryModalDynamic
        startImageId={photo.id.toString()}
        images={task.photos}
      />,
    );
  };

  return (
    <ScrollContainer horizontal={true} vertical={false} hideScrollbars={true}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {task.photos.map((photo, index) => {
          const photoWidth =
            task.photos.length <= 1
              ? ['100%', '100%', '400px']
              : ['90%', '90%', '400px'];

          return (
            <Box
              key={photo.id.toString()}
              id={photo.id.toString()}
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
                alt={`Blurred background for image ${index + 1}`}
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
                alt={`Image ${index + 1}`}
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
