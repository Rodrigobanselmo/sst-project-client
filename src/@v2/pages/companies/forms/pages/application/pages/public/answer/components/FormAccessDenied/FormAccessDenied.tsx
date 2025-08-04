import { Box, Typography } from '@mui/material';
import { MdOutlineLock } from 'react-icons/md';
import { SText } from '../../../../../../../../../../components/atoms/SText/SText';
import { SFlex } from '../../../../../../../../../../components/atoms/SFlex/SFlex';

interface SFormAccessDeniedProps {
  title?: string;
  message?: string;
  iconSize?: number;
  iconColor?: string;
}

export const FormAccessDenied = ({
  title = 'Acesso Negado',
  message = 'Formulário não está disponível para responder',
  iconSize = 64,
  iconColor = '#6b7280',
}: SFormAccessDeniedProps) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'gray.100',
        padding: 3,
      }}
    >
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 3,
          padding: 6,
          textAlign: 'center',
          maxWidth: 480,
          width: '100%',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
        }}
      >
        <SFlex direction="column" gap={4} alignItems="center">
          {/* Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              marginBottom: 2,
            }}
          >
            <MdOutlineLock size={iconSize} color={iconColor} />
          </Box>

          {/* Title */}
          <SText
            variant="h1"
            fontSize={24}
            sx={{
              color: '#374151',
              fontWeight: 600,
              marginBottom: 1,
            }}
          >
            {title}
          </SText>

          {/* Message */}
          <SText
            fontSize={16}
            sx={{
              color: '#6b7280',
              lineHeight: 1.5,
              maxWidth: 320,
            }}
          >
            {message}
          </SText>

          {/* Additional info */}
          <Box
            sx={{
              backgroundColor: '#f9fafb',
              borderRadius: 2,
              padding: 3,
              marginTop: 2,
              border: '1px solid #e5e7eb',
            }}
          >
            <SText
              fontSize={14}
              sx={{
                color: '#6b7280',
                maxWidth: 320,
                lineHeight: 1.4,
              }}
            >
              Entre em contato com o administrador com a empresa para obter acesso ao formulário.
            </SText>
          </Box>
        </SFlex>
      </Box>
    </Box>
  );
};
