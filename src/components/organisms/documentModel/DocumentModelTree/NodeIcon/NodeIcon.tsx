import DescriptionIcon from '@mui/icons-material/Description';

export const NodeIcon: React.FC<{ type: 'folder' | 'folder-open' | null }> = ({
  type,
}) => {
  if (type === 'folder')
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.013 2.40563C6.88362 2.27855 6.62643 2 6.18655 2C5.10958 1.99997 3.02037 2 2.4 2C1.63 2 1.007 2.61875 1.007 3.375L1 11.625C1 12.3813 1.63 13 2.4 13H13.6C14.37 13 15 12.3813 15 11.625V4.75C15 3.99375 14.37 3.375 13.6 3.375H8L7.013 2.40563Z"
          fill="#6F7E8C"
        />
      </svg>
    );
  if (type === 'folder-open')
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.013 2.40563C6.88362 2.27855 6.62643 2 6.18655 2C5.10958 1.99997 3.02037 2 2.4 2C1.63 2 1.007 2.61875 1.007 3.375L1 11.625C1 12.3813 1.63 13 2.4 13H13.6C14.37 13 15 12.3813 15 11.625V4.75C15 3.99375 14.37 3.375 13.6 3.375H8L7.013 2.40563Z"
          fill="#9CAEBE"
        />
        <path
          d="M1.8905 5.87596C1.95306 5.37554 2.37846 5 2.88278 5H14.8672C15.4687 5 15.9341 5.52718 15.8595 6.12403L15.1095 12.124C15.0469 12.6245 14.6215 13 14.1172 13H2.13278C1.53128 13 1.0659 12.4728 1.1405 11.876L1.8905 5.87596Z"
          fill="#6F7E8C"
        />
      </svg>
    );
  return <DescriptionIcon sx={{ color: '#70879c', fontSize: 16 }} />;
};
