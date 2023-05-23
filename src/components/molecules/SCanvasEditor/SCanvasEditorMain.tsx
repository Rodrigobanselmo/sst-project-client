import { calculateDimensionsWithMaxSize } from 'core/utils/helpers/calculateDimensionsWithMaxSize';
import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Text, Rect, Group } from 'react-konva';
import {
  ICanvasTextBox,
  IImageComponentProps,
} from './types/ICanvasMain.types';
import palette from 'configs/theme/palette';
import { SCanvasTextBox } from './components/SCanvasTextBox';

export const SCanvasEditorMain: React.FC<IImageComponentProps> = ({
  imageUrl,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textBoxes, setTextBoxes] = useState<ICanvasTextBox[]>([]);
  const [text, setText] = useState('');
  const [selectedItem, setSelectedItem] = React.useState<ICanvasTextBox | null>(
    null,
  );

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;

    img.onload = () => {
      setImage(img);
    };
  }, [imageUrl]);

  const handleAddTextBox = () => {
    const newTextBox: ICanvasTextBox = {
      id: Date.now().toString(),
      text,
    };

    setTextBoxes([...textBoxes, newTextBox]);
    setText('');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleDeleteTextBox = (id: string) => {
    const updatedTextBoxes = textBoxes.filter((textBox) => textBox.id !== id);
    setTextBoxes(updatedTextBoxes);
  };

  const handleEditTextBoxes = (data: Partial<ICanvasTextBox>) => {
    setTextBoxes((textBoxes) => {
      const updatedArray = textBoxes.map((item) => {
        if (item.id === data.id) {
          return { ...item, ...data };
        }
        return item;
      });

      return updatedArray;
    });
  };

  const { height, width } = calculateDimensionsWithMaxSize({
    width: image?.width,
    height: image?.height,
    maxWidth: containerRef.current?.offsetWidth,
    maxHeight: containerRef.current?.offsetHeight,
  });

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedItem(null);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', flex: 1, flexGrow: 1 }}
    >
      <div>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text"
        />
        <button type="button" onClick={handleAddTextBox}>
          Add Text Box
        </button>
      </div>
      <Stage
        width={width}
        height={height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          {image && (
            <Image
              image={image}
              width={width}
              height={height}
              alt="convas edit image"
            />
          )}
          {textBoxes.map((textBox, index) => {
            return (
              <SCanvasTextBox
                key={textBox.id}
                handleDeleteTextBox={handleDeleteTextBox}
                handleEditTextBoxes={handleEditTextBoxes}
                textBox={textBox}
                index={index}
                isSelected={textBox.id === selectedItem?.id}
                handleSlect={(item) => setSelectedItem(item)}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default SCanvasEditorMain;
