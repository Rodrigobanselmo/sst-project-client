import React from 'react';

import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';
import ListAltIcon from '@mui/icons-material/ListAlt';

type Props = {
  droppable?: boolean;
  fileType?: string;
};

export const TypeIcon: React.FC<{ children?: any } & Props> = (props) => {
  if (props.droppable) {
    return <FolderIcon />;
  }

  switch (props.fileType) {
    case 'image':
      return <ImageIcon />;
    case 'csv':
      return <ListAltIcon />;
    case 'text':
      return <DescriptionIcon />;
    default:
      return null;
  }
};
