/* eslint-disable react/display-name */
import { calculateDimensionsWithMaxSize } from 'core/utils/helpers/calculateDimensionsWithMaxSize';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Image,
  Text,
  Rect,
  Group,
  Line,
  Circle,
} from 'react-konva';
import {
  ICanvasPath,
  ICanvasTextBox,
  IImageComponentProps,
} from './types/ICanvasMain.types';
import TimelineIcon from '@mui/icons-material/Timeline';
import palette from 'configs/theme/palette';
import { SCanvasTextBox } from './components/SCanvasTextBox';
import {
  Box,
  ClickAwayListener,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { urlToDataUrl, urlToFile } from 'core/utils/helpers/urlToFile.utils';
import {
  ImageBlobCompressProps,
  imageBlobCompress,
} from 'core/utils/helpers/imageBlobCompress';
import CropIcon from '@mui/icons-material/Crop';
import RttIcon from '@mui/icons-material/Rtt';
import { STagButton } from 'components/atoms/STagButton';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { SAddIcon } from 'assets/icons/SAddIcon';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import { SCanvasPath } from './components/SCanvasPath';
import Konva from 'konva';
import { simulateAwait } from 'core/utils/helpers/simulateAwait';
import { useWindowSize } from 'core/hooks/useWindowSize';

const SCanvasEditorMain = React.forwardRef<any, IImageComponentProps>(
  ({ imageUrl, minHeight, minWidth, canvasRef, onCrop }, ref) => {
    const [text, setText] = useState('');
    const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
    const [addPaths, setAddPaths] = React.useState(0);
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    const [textBoxes, setTextBoxes] = useState<ICanvasTextBox[]>([]);
    const [paths, setPaths] = useState<ICanvasPath[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const circleMouseRef = useRef<any>(null);
    const inputRef = useRef<any>(null);
    const imageRef = useRef<any>(null);
    const pathRef = useRef<{
      handleLineDragMouse: (e: any) => void;
      handleStageClick: (e: any) => void;
    }>(null);

    useWindowSize();

    const { height, width } = calculateDimensionsWithMaxSize({
      width: image?.width,
      height: image?.height,
      maxWidth: containerRef.current?.offsetWidth,
      maxHeight: containerRef.current?.offsetHeight,
      minHeight,
      minWidth,
    });

    const imageWidth = image?.naturalWidth || 0;
    const imageHeight = image?.naturalHeight || 0;

    const scaleX = imageWidth ? imageWidth / width : 0;
    const scaleY = imageHeight ? imageHeight / height : 0;

    const pixelRatio = 1;
    const canvasRealWidth = Math.floor(width * scaleX * pixelRatio);
    const canvasRealHeight = Math.floor(height * scaleY * pixelRatio);

    useEffect(() => {
      const img = new window.Image();

      const onLoadImage = async () => {
        const canvaUrl = canvasRef?.current?.toDataURL();
        const url = await (imageUrl
          ? urlToDataUrl({ url: imageUrl })
          : canvasRef?.current?.toDataURL());

        if (url) img.src = url;

        img.onload = () => {
          setImage(img);
        };
      };

      onLoadImage();
    }, [canvasRef, imageUrl]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    };

    const handleAddTextBox = () => {
      if (!text) return inputRef.current?.focus();

      const newTextBox: ICanvasTextBox = {
        id: Date.now().toString(),
        text,
      };

      setTextBoxes([...textBoxes, newTextBox]);
      setText('');
    };

    const handleAddLine = () => {
      setAddPaths(1);
    };

    const handleDeletePath = (id: string) => {
      const newPaths = paths.filter((path) => path.id !== id);
      setPaths(newPaths);
      setAddPaths(0);
    };

    const handleDeleteTextBox = (id: string) => {
      const updatedTextBoxes = textBoxes.filter((textBox) => textBox.id !== id);
      setTextBoxes(updatedTextBoxes);
    };

    const handleEditPath = (data: Partial<ICanvasPath>) => {
      setPaths((path) => {
        const updatedArray = path.map((item) => {
          if (item.id === data.id) {
            return { ...item, ...data };
          }
          return item;
        });

        return updatedArray;
      });
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

    const checkDeselect = (e: any) => {
      // const clickedOnEmpty = e.target === e.target.getStage();
      // if (clickedOnEmpty) {
      setSelectedItem(null);
      // }
    };

    const handleDownloadImage = async () => {
      if (!image) return;
      if (!stageRef.current) return;

      stageRef.current.width(canvasRealWidth);
      stageRef.current.height(canvasRealHeight);
      stageRef.current.scaleX(scaleX);
      stageRef.current.scaleY(scaleY);

      //simulate await to remove buttons of konva items
      await simulateAwait(400);
      const blob = await stageRef.current.getStage().toBlob();
      const { dataUrl } = await imageBlobCompress({
        blob,
        compressionRules: [{ minSize: 1, quality: 1 }],
      });

      stageRef.current.scaleX(1);
      stageRef.current.scaleY(1);
      stageRef.current.width(width);
      stageRef.current.height(height);

      // console.log(dataUrl);
      // return;
      // const dataUrl = stageRef.current.getStage().toDataURL();

      const a = document.createElement('a');
      document.body.appendChild(a);
      (a as any).style = 'display: none';

      a.href = dataUrl;
      a.download = 'canvasImage.jpeg';
      a.click();

      // Remove the "invisible" element
      document.body.removeChild(a);

      return; //

      // const canvas = handleSetCanvasRef();
      // if (!canvas) return;

      // const dataUrl = canvas.toDataURL();
      // console.log(99, dataUrl);
      // const link = document.createElement('a');
      // link.href = dataUrl;
      // link.download = 'image.png'; // Set the desired file name and extension
      // link.click();
      // return;

      // const stage = document.createElement('canvas');
      // stage.width = 800; // Set the desired width of the canvas
      // stage.height = 600; // Set the desired height of the canvas
      // const stageContext = stage.getContext('2d');

      // if (stageContext && image) {
      //   stageContext.drawImage(image, 0, 0, stage.width, stage.height);

      //   const dataUrl = stage.toDataURL();
      //   const link = document.createElement('a');
      //   link.href = dataUrl;
      //   link.download = 'image.png'; // Set the desired file name and extension
      //   link.click();
      // }
    };

    const handleCanvas = async (data?: {
      compressProps?: Partial<ImageBlobCompressProps>;
    }) => {
      if (!image) return;
      if (!stageRef.current) return;

      stageRef.current.scaleX(1);
      stageRef.current.scaleY(1);
      stageRef.current.width(width);
      stageRef.current.height(height);

      await simulateAwait(200);

      stageRef.current.width(canvasRealWidth);
      stageRef.current.height(canvasRealHeight);
      stageRef.current.scaleX(scaleX);
      stageRef.current.scaleY(scaleY);

      //simulate await to remove buttons of konva items

      const blob = await stageRef.current.getStage().toBlob();
      const { dataUrl, file } = await imageBlobCompress({
        blob,
        ...data?.compressProps,
      });
      console.log('size', file.size);

      await simulateAwait(400);

      stageRef.current.scaleX(1);
      stageRef.current.scaleY(1);
      stageRef.current.width(width);
      stageRef.current.height(height);

      return { dataUrl, file };
    };

    const handleCropImage = async () => {
      if (!image) return;
      if (!stageRef.current) return;

      stageRef.current.width(canvasRealWidth);
      stageRef.current.height(canvasRealHeight);
      stageRef.current.scaleX(scaleX);
      stageRef.current.scaleY(scaleY);

      //simulate await to remove buttons of konva items
      await simulateAwait(400);

      const blob = await stageRef.current.getStage().toBlob();

      const { dataUrl, file } = await imageBlobCompress({
        blob,
        resize: false,
        compressionRules: [{ minSize: 0, quality: 1 }],
      });

      onCrop?.({ dataUrl, file });

      stageRef.current.scaleX(1);
      stageRef.current.scaleY(1);
      stageRef.current.width(width);
      stageRef.current.height(height);
    };

    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        handleAddTextBox();
      }
    };

    const handleStageClick = (e: any) => {
      if (addPaths) {
        if (addPaths != 1) {
          pathRef.current?.handleStageClick(e);
        } else {
          const stage = e.target.getStage();
          const point = stage.getPointerPosition();

          const newPath: ICanvasPath = {
            id: Date.now().toString(),
            initX: point.x,
            initY: point.y,
          };

          setSelectedItem(newPath.id);
          setPaths([...paths, newPath]);
        }
      }
    };

    const handleStageMouseMove = (e: any) => {
      if (addPaths == 0) return;

      const stage = e.target.getStage();
      const { x, y } = stage.getPointerPosition();

      circleMouseRef.current?.x(x);
      circleMouseRef.current?.y(y);

      pathRef.current?.handleLineDragMouse(e);
    };

    useImperativeHandle(ref, () => ({
      handleGetCanvas: () => handleCanvas(),
    }));

    // const handleSetCanvasRef = () => {
    //   if (stageRef.current && canvasRef.current) {
    //     const stage = stageRef.current;
    //     const canvas = canvasRef.current;
    //     const context = canvas.getContext('2d');

    //     if (context) {
    //       context.clearRect(0, 0, canvasRealWidth, canvasRealHeight);
    //       stage.toCanvas(context);

    //       return canvas;
    //     }
    //   }
    // };

    // const pixelRatio2 = window.devicePixelRatio || 1;
    // const canvasWidth = imageWidth * pixelRatio2;
    // const canvasHeight = imageHeight * pixelRatio2;

    const offsetX = containerRef.current?.offsetWidth
      ? (containerRef.current?.offsetWidth - width) / 4
      : 0;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SFlex align={'center'} mb={5}>
          <SInput
            inputRef={inputRef}
            endAdornment={
              <IconButton
                onClick={() => handleAddTextBox()}
                sx={{ ml: '-3px', p: 0 }}
              >
                <SAddIcon sx={{ fontSize: '22px' }} />
              </IconButton>
            }
            onKeyDown={handleKeyPress}
            placeholder={'adicionar texto...'}
            onChange={handleTextChange}
            value={text}
            superSmall
            sx={{ mb: 2 }}
          />
          <STagButton
            text={'Texto'}
            large
            icon={RttIcon}
            onClick={handleAddTextBox}
          />
          <STagButton
            large
            text={'Linhas'}
            icon={TimelineIcon}
            onClick={handleAddLine}
          />
          <STagButton
            large
            text={'Cortar'}
            icon={CropIcon}
            onClick={handleCropImage}
          />
          {/* <button type="button" onClick={handleDownloadImage}>
          Download Image
        </button> */}
        </SFlex>
        <Box
          ref={containerRef}
          sx={{
            flexGrow: 1,
            flex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          <ClickAwayListener
            onClickAway={() => {
              setSelectedItem(null);
            }}
          >
            <Box
              sx={{
                paddingLeft: offsetX,
                backgroundColor: 'grey.300',
              }}
            >
              <Stage
                ref={stageRef}
                width={width}
                height={height}
                onClick={handleStageClick}
                onMouseMove={handleStageMouseMove}
              >
                <Layer>
                  {image && (
                    <Image
                      ref={imageRef}
                      onMouseDown={checkDeselect}
                      onTouchStart={checkDeselect}
                      image={image}
                      width={width}
                      height={height}
                      alt="convas edit image"
                    />
                  )}
                  {!!addPaths && (
                    <Circle
                      zIndex={900}
                      ref={circleMouseRef}
                      x={-10}
                      y={-10}
                      radius={5}
                      fill={palette.primary.main}
                      stroke={palette.primary.main}
                      strokeWidth={2}
                    />
                  )}
                  {paths.map((path, index) => (
                    <SCanvasPath
                      key={index}
                      ref={pathRef}
                      index={index}
                      data={path}
                      handleStopPath={() => setAddPaths(0)}
                      updateFunc={() => setAddPaths((add) => add + 1)}
                      isSelected={path.id === selectedItem}
                      handleSelect={(item) => setSelectedItem(item?.id || null)}
                      handleDelete={handleDeletePath}
                      handleEdit={handleEditPath}
                    />
                  ))}
                  {textBoxes.map((textBox, index) => {
                    return (
                      <SCanvasTextBox
                        key={textBox.id}
                        handleDeleteTextBox={handleDeleteTextBox}
                        handleEditTextBoxes={handleEditTextBoxes}
                        textBox={textBox}
                        index={index}
                        isSelected={textBox.id === selectedItem}
                        handleSelect={(item) =>
                          setSelectedItem(item?.id || null)
                        }
                        scale={Math.min(1.5, Math.max(1, 1 / scaleX))}
                        // scale={Math.min(1.5, Math.max(0.9, 1 / scaleX))}
                        // scale={1 / scaleX}
                      />
                    );
                  })}
                </Layer>
              </Stage>
            </Box>
          </ClickAwayListener>
        </Box>
      </div>
    );
  },
);

function WrappedSCanvasEditorMain({
  editorRef,
  ...props
}: IImageComponentProps & { editorRef: any }) {
  return <SCanvasEditorMain {...props} ref={editorRef} />;
}

export default WrappedSCanvasEditorMain;
