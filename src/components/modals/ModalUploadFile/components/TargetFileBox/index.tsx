import type { CSSProperties, FC } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

const style: CSSProperties = {
  border: '1px solid gray',
  height: '15rem',
  width: '15rem',
  padding: '2rem',
  textAlign: 'center',
};

interface ITargetItem {
  files: File[];
}

export interface ITargetFileBoxProps {
  onDrop: (item: ITargetItem) => void;
}

export const TargetFileBox: FC<ITargetFileBoxProps> = ({ onDrop }) => {
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: any[] }) {
        if (onDrop) {
          onDrop(item);
        }
      },
      canDrop(item: ITargetItem) {
        console.log('canDrop', item.files);
        const acceptType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const accept = item.files.every((file: File) => {
          return file.type === acceptType;
        });

        return accept;
      },
      hover(item: ITargetItem) {
        console.log('hover', item.files);
      },
      collect: (monitor: DropTargetMonitor) => {
        const item = monitor.getItem() as ITargetItem;
        if (item) {
          console.log('collect', item.files);
        }

        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        };
      },
    }),
    [onDrop],
  );

  const isActive = canDrop && isOver;
  return (
    <div ref={drop} style={style}>
      {isActive ? 'Release to drop' : 'Drag file here'}
    </div>
  );
};
