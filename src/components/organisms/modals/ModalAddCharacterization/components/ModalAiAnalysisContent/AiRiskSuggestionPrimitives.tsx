import React, { useEffect, useRef, useState } from 'react';

import { Box, IconButton, TextField } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { SText } from '@v2/components/atoms/SText/SText';

export type AiRiskSectionHeaderProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
};

export const AiRiskSectionHeader: React.FC<AiRiskSectionHeaderProps> = ({
  children,
  variant = 'primary',
  icon,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <Box
      sx={{
        backgroundColor: isPrimary ? 'grey.50' : 'transparent',
        border: isPrimary ? '1px solid' : undefined,
        borderColor: isPrimary ? 'grey.200' : 'transparent',
        px: isPrimary ? 4 : 0,
        mt: isPrimary ? 8 : 0,
        borderRadius: 1,
        mb: isPrimary ? 4 : 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          backgroundColor: isPrimary ? 'grey.50' : 'transparent',
          py: 2,
        }}
      >
        {icon && (
          <Box sx={{ color: isPrimary ? 'grey.600' : 'grey.600' }}>{icon}</Box>
        )}

        <SText
          variant="body2"
          sx={{
            color: isPrimary ? 'grey.700' : 'grey.700',
            fontSize: isPrimary ? '13px' : '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {children}
        </SText>
      </Box>
    </Box>
  );
};

export type AiRiskRemovableTagProps = {
  label: string;
  onRemove: () => void;
  onEdit?: (newValue: string) => void;
  editable?: boolean;
};

export const AiRiskRemovableTag: React.FC<AiRiskRemovableTagProps> = ({
  label,
  onRemove,
  onEdit,
  editable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const input = inputRef.current.querySelector('input');
      if (input) {
        input.focus();
        setTimeout(() => {
          input.select();
        }, 0);
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    if (onEdit && editValue.trim() !== label) {
      onEdit(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleClick = () => {
    if (editable && onEdit) {
      setIsEditing(true);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: isEditing ? 'primary.200' : 'grey.200',
        width: '100%',
        mb: 1,
        cursor: editable && onEdit ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: isEditing ? 'primary.50' : 'grey.100',
          borderColor: isEditing ? 'primary.200' : 'grey.300',
        },
      }}
    >
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          p: 0.5,
          minWidth: 'auto',
          width: 24,
          height: 24,
          color: 'grey.500',
          '&:hover': {
            backgroundColor: 'grey.200',
            color: 'grey.700',
          },
        }}
      >
        <CancelOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>

      {isEditing ? (
        <TextField
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          variant="standard"
          size="small"
          sx={{
            flex: 1,
            '& .MuiInput-root': {
              fontSize: '0.875rem',
              '&:before': {
                borderBottom: 'none',
              },
              '&:after': {
                borderBottom: '2px solid',
                borderColor: 'primary.main',
              },
              '&:hover:not(.Mui-disabled):before': {
                borderBottom: 'none',
              },
            },
            '& .MuiInput-input': {
              padding: 0,
              color: 'text.primary',
              lineHeight: 1.4,
            },
          }}
        />
      ) : (
        <SText
          variant="body2"
          onClick={handleClick}
          sx={{
            color: 'text.primary',
            fontSize: '0.875rem',
            flex: 1,
            wordBreak: 'break-word',
            lineHeight: 1.4,
            cursor: editable && onEdit ? 'pointer' : 'default',
            '&:hover':
              editable && onEdit
                ? {
                    color: 'primary.main',
                  }
                : {},
          }}
        >
          {label}
        </SText>
      )}
    </Box>
  );
};
