import React, { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DeleteIcon from '@mui/icons-material/Delete';
import FeedIcon from '@mui/icons-material/Feed';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';

import SCalendarIcon from 'assets/icons/SCalendarIcon';
import SExamIcon from 'assets/icons/SExamIcon';

import SFlex from '../SFlex';
import { ISTagProps } from './types';

export const STagAction: FC<{ children?: any } & ISTagProps> = ({
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
        return 'success.dark';
      case 'schedule':
        return 'info.main';
      case 'version':
        return 'info.main';
      case 'edit':
        return 'tag.edit';
      case 'select':
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

  // return (
  //   <SFlex
  //     sx={{
  //       border: '3px solid',
  //       borderColor: color(),
  //       borderRadius: '100%',
  //       height: '12px',
  //       width: '12px',
  //       mr: 2,
  //       fontSize: '12px',
  //       ...sx,
  //     }}
  //     align="center"
  //     {...props}
  //   ></SFlex>
  // );

  return (
    <SFlex
      sx={{
        border: '1px solid',
        borderColor: color(),
        borderRadius: '3px',
        color: color(),
        pr: 8,
        pl: action === 'add' ? 3 : 6,
        mr: 2,
        fontSize: '12px',
        ...sx,
      }}
      align="center"
      {...props}
    >
      {(action === 'add' || action === 'version') && (
        <AddIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {action === 'edit' && (
        <FeedIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {action === 'delete' && (
        <DeleteIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {action === 'info' && (
        <HelpCenterIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {action === 'success' && (
        <CheckBoxIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {action === 'schedule' && (
        <SCalendarIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {action === 'select' && (
        <CheckBoxIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {action === 'warning' && (
        <WarningIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {action === 'error' && (
        <ReportIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {action === 'upload' && (
        <FileUploadOutlinedIcon sx={{ fontSize: '16px', color: color() }} />
      )}
      {!text && (
        <>
          {action === 'add' ? 'Adicionar' : ''}
          {action === 'edit' ? 'Editar' : ''}
          {action === 'delete' ? 'Deletar' : ''}
          {action === 'info' ? 'Aviso' : ''}
          {action === 'success' ? 'Sucesso' : ''}
          {action === 'warning' ? 'Atenção' : ''}
          {action === 'error' ? 'Erro' : ''}
          {action === 'upload' ? 'Envio' : ''}
          {action === 'version' ? 'Nova versão' : ''}
          {action === 'select' ? 'Selecione' : ''}
        </>
      )}
      {text || ''}

      {Icon && <Icon sx={{ fontSize: '18px', color: 'common.white' }} />}
    </SFlex>
  );
};
