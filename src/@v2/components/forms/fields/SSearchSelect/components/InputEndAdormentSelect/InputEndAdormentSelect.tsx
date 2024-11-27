import CloseIcon from '@mui/icons-material/Close';
import { CircularProgress, IconButton, InputAdornment } from '@mui/material';

export interface InputEndAdormentSelectProps {
  loading?: boolean;
  onClear: (event: React.SyntheticEvent) => void;
}

export function InputEndAdormentSelect({
  onClear,
  loading,
}: InputEndAdormentSelectProps) {
  return (
    <>
      <InputAdornment
        className="close-icon"
        position="end"
        sx={{ cursor: 'pointer ', mr: 0 }}
        onClick={(e) => {
          onClear?.(e);
        }}
      >
        <IconButton sx={{ width: 25, height: 25 }}>
          <CloseIcon sx={{ color: 'text.light', fontSize: 20 }} />
        </IconButton>
      </InputAdornment>
      {loading && (
        <InputAdornment position="end">
          <CircularProgress color="inherit" size={20} />
        </InputAdornment>
      )}
    </>
  );
}
