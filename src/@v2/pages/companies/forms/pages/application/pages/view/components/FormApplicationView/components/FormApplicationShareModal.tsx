import { Box, Typography } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SModalHeader } from '@v2/components/organisms/SModal/components/SModalHeader/SModalHeader';
import { SModalPaper } from '@v2/components/organisms/SModal/components/SModalPaper/SModalPaper';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import SIconCopy from 'assets/icons/SCopyIcon';
import SDownloadIcon from 'assets/icons/SDownloadIcon';
import SIconLink from 'assets/icons/SLinkIcon';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';

// Dynamic import for QR code to avoid SSR issues
const QRCode = dynamic(
  () =>
    import('@rc-component/qrcode').then((mod) => ({ default: mod.QRCodeSVG })),
  {
    ssr: false,
  },
);

interface FormApplicationShareModalProps {
  formApplication: FormApplicationReadModel;
  onClose: () => void;
}

export const FormApplicationShareModal = ({
  formApplication,
  onClose,
}: FormApplicationShareModalProps) => {
  const { showSnackBar } = useSystemSnackbar();
  const qrCodeContainerRef = useRef<HTMLDivElement>(null);
  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);

  const publicUrl = useMemo(() => {
    const url = formApplication.publicUrl;
    return `${window.location.origin}${url}`;
  }, [formApplication.id]);

  // Get the SVG element after QR code renders
  useEffect(() => {
    if (qrCodeContainerRef.current) {
      const svg = qrCodeContainerRef.current.querySelector('svg');
      if (svg) {
        setSvgElement(svg);
      }
    }
  }, [publicUrl]);

  const handleCopyUrl = () => {
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        showSnackBar('Link copiado para a área de transferência!', {
          type: 'success',
        });
      })
      .catch(() => {
        showSnackBar('Erro ao copiar o link. Tente novamente.', {
          type: 'error',
        });
      });
  };

  const handleDownloadQRCode = () => {
    if (!svgElement) {
      showSnackBar('Erro ao baixar o QR Code. Tente novamente.', {
        type: 'error',
      });
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `qr-code-${formApplication.name.replace(/[^a-zA-Z0-9]/g, '-')}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(svgUrl);

      showSnackBar('QR Code baixado com sucesso!', {
        type: 'success',
      });
    } catch (error) {
      console.error(error);
      showSnackBar('Erro ao baixar o QR Code. Tente novamente.', {
        type: 'error',
      });
    }
  };

  return (
    <SModalPaper center sx={{ maxWidth: 500, width: '90%' }}>
      <SModalHeader onClose={onClose} title="Compartilhar Formulário" />

      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {formApplication.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
          Compartilhe este link para que outros possam responder ao formulário
        </Typography>

        {/* QR Code */}
        <Box
          ref={qrCodeContainerRef}
          sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}
        >
          <QRCode value={publicUrl} size={200} level="M" includeMargin={true} />
        </Box>
        <SButton
          text="Baixar QR Code"
          icon={<SDownloadIcon sx={{ fontSize: 16 }} />}
          buttonProps={{
            sx: {
              mb: 6,
            },
          }}
          onClick={handleDownloadQRCode}
          variant="outlined"
          size="s"
          color="info"
          disabled={!svgElement}
        />

        {/* URL Display */}
        <Box
          sx={{
            p: 4,
            bgcolor: 'grey.100',
            borderRadius: 1,
            mb: 8,
            wordBreak: 'break-all',
          }}
        >
          <Typography variant="body2" fontFamily="monospace">
            {publicUrl}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <SButton
            text="Copiar Link"
            icon={<SIconCopy sx={{ fontSize: 16 }} />}
            onClick={handleCopyUrl}
            variant="contained"
            color="primary"
          />
          <SButton
            text="Abrir Link"
            icon={<SIconLink sx={{ fontSize: 16 }} />}
            onClick={() => window.open(publicUrl, '_blank')}
            variant="outlined"
            color="primary"
          />
        </Box>
      </Box>
    </SModalPaper>
  );
};
