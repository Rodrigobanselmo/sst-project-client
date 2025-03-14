import { SIconDownload } from '@v2/assets/icons/SIconDownload/SIconDownload';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { FC } from 'react';
import { SDownloadRowProps } from './SDownloadRow.types';
import { donwloadPublicUrl } from '@v2/utils/download-public-url';

export const SDownloadRow: FC<SDownloadRowProps> = ({
  disabled,
  children,
  iconButtonProps,
  url,
  ...props
}) => {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (url) donwloadPublicUrl(url);
  }

  return (
    <SFlex center onClick={(e) => e.stopPropagation()}>
      <SIconButton
        {...props}
        onClick={handleClick}
        disabled={!url || disabled}
        iconButtonProps={{
          sx: { my: -6 },
        }}
      >
        <SIconDownload color="primary.main" />
      </SIconButton>
    </SFlex>
  );
};
