import React, { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DeleteIcon from '@mui/icons-material/Delete';
import FeedIcon from '@mui/icons-material/Feed';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';

import SFlex from '../SFlex';
import { ISTagProps } from './types';

export const STagAction: FC<ISTagProps> = ({
  text,
  action,
  icon: Icon,
  sx,
  ...props
}) => {
  if (action === 'none') return null;

  const color = () => {
    switch (action) {
      case 'add':
        return 'tag.add';
      case 'edit':
        return 'tag.edit';
      case 'delete':
        return 'tag.delete';
      case 'success':
        return 'success.dark';
      case 'warning':
        return 'warning.main';
      case 'info':
        return 'info.main';
      case 'error':
        return 'error.main';
      case 'upload':
        return 'info.main';

      default:
        break;
    }
  };

  return (
    <SFlex
      sx={{
        backgroundColor: color(),
        borderRadius: '3px',
        color: 'common.white',
        pr: 8,
        pl: action === 'add' ? 3 : 6,
        mr: 2,
        ...sx,
      }}
      align="center"
      {...props}
    >
      {action === 'add' && (
        <AddIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {action === 'edit' && (
        <FeedIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {action === 'delete' && (
        <DeleteIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {action === 'info' && (
        <HelpCenterIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {action === 'success' && (
        <CheckBoxIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {action === 'warning' && (
        <WarningIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {action === 'error' && (
        <ReportIcon sx={{ fontSize: '18px', color: 'common.white' }} />
      )}
      {action === 'upload' && (
        <FileUploadOutlinedIcon
          sx={{ fontSize: '16px', color: 'common.white' }}
        />
      )}
      {!action ? text : ''}
      {action === 'add' ? 'Adicionar' : ''}
      {action === 'edit' ? 'Editar' : ''}
      {action === 'delete' ? 'Deletar' : ''}
      {action === 'info' ? 'Aviso' : ''}
      {action === 'success' ? 'Sucesso' : ''}
      {action === 'warning' ? 'Atenção' : ''}
      {action === 'error' ? 'Erro' : ''}
      {action === 'upload' ? 'Exportar' : ''}

      {Icon && <Icon sx={{ fontSize: '18px', color: 'common.white' }} />}
    </SFlex>
  );
};
