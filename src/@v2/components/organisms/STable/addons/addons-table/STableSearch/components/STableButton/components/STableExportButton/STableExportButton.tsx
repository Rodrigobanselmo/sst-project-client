import { FC, useRef, useState } from 'react';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box } from '@mui/material';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { SPopperMenu } from '@v2/components/organisms/SPopper/addons/SPopperMenu/SPopperMenu';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { STableButton } from '../../STableButton';
import { STableExportButtonProps } from './STableExportButton.types';

export const STableExportButton: FC<STableExportButtonProps> = ({
  onClick,
  menuItems,
  text,
  disabled,
  tableButtonProps,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const anchorEl = useRef<HTMLDivElement | null>(null);
  const { isOpen, toggle, close } = useDisclosure();
  const hasMenu = Boolean(menuItems?.length);

  const runExport = async (task: () => Promise<void> | void) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await task();
    } catch {
      // Mutation/onError already surfaces the failure; keep the menu usable.
    } finally {
      setIsLoading(false);
    }
  };

  if (hasMenu) {
    return (
      <Box onClick={(event) => event.stopPropagation()}>
        <Box ref={anchorEl}>
          <STableButton
            onClick={() => {
              if (isLoading) return;
              toggle();
            }}
            disabled={disabled || isLoading}
            loading={isLoading}
            color="info"
            text={text ?? 'Exportar'}
            icon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
            rightIcon={KeyboardArrowDownIcon}
            {...tableButtonProps}
          />
        </Box>
        <SPopperArrow
          disabledArrow
          placement="bottom-end"
          anchorEl={anchorEl}
          isOpen={isOpen}
          close={close}
          color="paper"
        >
          <SPopperMenu>
            {menuItems?.map((item) => (
              <SPopperMenuItem
                key={item.id}
                text={item.label}
                disabled={isLoading}
                onClick={() => {
                  close();
                  void runExport(item.onClick);
                }}
              />
            ))}
          </SPopperMenu>
        </SPopperArrow>
      </Box>
    );
  }

  return (
    <STableButton
      onClick={async (event) => {
        if (!onClick) return;
        await runExport(() => onClick(event));
      }}
      disabled={disabled}
      loading={isLoading}
      color="info"
      text={text ?? 'Exportar'}
      icon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
      {...tableButtonProps}
    />
  );
};
