import { Box } from '@mui/material';
import { ActionPlanReadPhotoModel } from '@v2/models/security/models/action-plan/action-plan-read-photo.model';
import Image from 'next/image';
import Slider from 'react-slick';
import ExpandIcon from '@mui/icons-material/Expand';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import ScrollContainer from 'react-indiana-drag-scroll';

export const ActionPlanSliderPhotos = ({
  photos,
}: {
  photos: ActionPlanReadPhotoModel[];
}) => {
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    centerMode: true,
    centerPadding: '0px',
    responsive: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
        },
      },
    ],
  };

  const handleImageClick = (photo: ActionPlanReadPhotoModel) => {
    window.open(photo.url, '_blank');
  };

  return (
    <ScrollContainer horizontal={true} vertical={false} hideScrollbars={true}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {photos.map((photo, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              minWidth:
                photos.length <= 1
                  ? ['100%', '100%', '400px']
                  : ['90%', '90%', '400px'],
              height: '225px',
              marginRight: '10px',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {/* Blurred Background Image */}
            <Image
              src={photo.url}
              alt={`Blurred background for characterization photo ${index + 1}`}
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
              onClick={() => handleImageClick(photo)}
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
          </Box>
        ))}
      </Box>
    </ScrollContainer>
  );
};
