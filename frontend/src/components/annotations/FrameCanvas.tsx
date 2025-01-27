import "./FrameCanvas.scss";
import { FrameState } from "../../types";
import { HTMLProps } from "react";

export interface FrameCanvasProps extends HTMLProps<HTMLDivElement> {
    frame: FrameState;
}

const FrameCanvas: React.FC<FrameCanvasProps> = ({
    frame,
    style
}) => {


    return (
        <div 
            className="FrameCanvas"
            style={style}
        >
            <img 
                className="FrameCanvas-image"
                src={frame.dataUrl}
            />
        </div>
    );
}
export default FrameCanvas;