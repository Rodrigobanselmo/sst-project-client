export interface IImageComponentProps {
  imageUrl?: string;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  minWidth?: number;
  minHeight?: number;
  onCrop?: (options: { dataUrl: string; file: File }) => void;
}

export interface ICanvasTextBox {
  id: string;
  text: string;
}

export interface ICanvasPath {
  id: string;
  initX: number;
  initY: number;
}
