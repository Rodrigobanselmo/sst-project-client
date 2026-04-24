import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import { useKBar } from 'kbar';

export const SearchBar = () => {
  const { query } = useKBar();

  return (
    <IconButton
      aria-label="Abrir busca"
      onClick={() => {
        query.toggle();
      }}
      sx={{
        flexShrink: 0,
        alignSelf: 'center',
        mr: 2,
      }}
    >
      <SearchIcon sx={{ fontSize: ['1rem', '1.125rem', '1.2rem'] }} />
    </IconButton>
  );
};
