import { IconButton, Box } from '@mui/material';
import { useTextToSpeech } from '@v2/hooks/useTextToSpeech';
import { MdVolumeUp, MdStop } from 'react-icons/md';
import STooltip from '../STooltip/STooltip';

interface SSpeakButtonProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  tooltip?: string;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

/**
 * A button that reads text aloud using Text-to-Speech
 * Useful for accessibility, especially for users who cannot read
 */
export const SSpeakButton = ({
  text,
  size = 'medium',
  tooltip = 'Ouvir',
  color = 'primary.main',
  showLabel = false,
  label = 'Ouvir',
}: SSpeakButtonProps) => {
  const { speak, stop, isSpeaking, isSupported, originalText } =
    useTextToSpeech();

  if (!isSupported) {
    return null;
  }

  const isCurrentlySpeakingThis = isSpeaking && originalText === text;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentlySpeakingThis) {
      stop();
    } else {
      speak(text);
    }
  };

  const iconSize = size === 'small' ? 22 : size === 'large' ? 32 : 26;
  const buttonSize = size === 'small' ? 32 : size === 'large' ? 48 : 40;

  return (
    <STooltip title={isCurrentlySpeakingThis ? 'Parar' : tooltip}>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton
          onClick={handleClick}
          size={size}
          aria-label={
            isCurrentlySpeakingThis ? 'Parar de ouvir' : 'Ouvir texto'
          }
          sx={{
            width: buttonSize,
            height: buttonSize,
            minWidth: buttonSize,
            color: isCurrentlySpeakingThis ? '#e53935' : '#2196f3',
            backgroundColor: 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
              transform: 'scale(1.15)',
            },
            animation: isCurrentlySpeakingThis
              ? 'pulse 1.5s ease-in-out infinite'
              : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        >
          {isCurrentlySpeakingThis ? (
            <MdStop size={iconSize} />
          ) : (
            <MdVolumeUp size={iconSize} />
          )}
        </IconButton>
        {showLabel && (
          <Box
            component="span"
            sx={{
              fontSize: size === 'small' ? 12 : 14,
              color: 'text.secondary',
              cursor: 'pointer',
            }}
            onClick={handleClick}
          >
            {isCurrentlySpeakingThis ? 'Parar' : label}
          </Box>
        )}
      </Box>
    </STooltip>
  );
};
