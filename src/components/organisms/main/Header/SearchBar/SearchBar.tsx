import { Box } from '@mui/material';
import { useKBar } from 'kbar';
import SearchIcon from '@mui/icons-material/Search';

export const SearchBar = () => {
  const { query } = useKBar();

  return (
    <Box
      onClick={() => {
        query.toggle();
      }}
      sx={{
        cursor: 'pointer',
        width: 30,
        mr: 5,
        height: '31px',
        borderRadius: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        border: '1px solid',
        borderColor: 'grey.300',
        boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.05)',
        '-webkit-box-shadow': '1px 1px 2px 1px rgba(0, 0, 0, 0.05)',
        ':hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <SearchIcon sx={{ fontSize: '15px', mt: 0, color: 'grey.800' }} />
    </Box>
  );
};
