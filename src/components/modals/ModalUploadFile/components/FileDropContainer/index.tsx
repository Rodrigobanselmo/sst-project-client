import type { FC } from 'react';
import { useState, useCallback } from 'react';

import { FileList } from '../FileList';
import { TargetFileBox } from '../TargetFileBox';

export const FileDropContainer: FC = () => {
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

  const handleFileDrop = useCallback(
    (item) => {
      if (item) {
        const files = item.files;
        setDroppedFiles(files);
      }
    },
    [setDroppedFiles],
  );

  return (
    <>
      <TargetFileBox onDrop={handleFileDrop} />
      <FileList files={droppedFiles} />
    </>
  );
};
