import "./FrameSelection.scss";
import FrameSelectionNaveBar from "../components/frameSelection/NavBar";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { convertFrame } from "../services/framesService";
import { FrameState } from "../types";

function FrameSelection() {
    const [frame, setFrame] = useState<FrameState | null>();
    const [path, setPath] = useState("");

    const handleClick = async () => {
        if (!frame) return;
        await convertFrame(frame.path);
        setTimeout(()=> setFrame(null), 100);
    }

    return (
        <div className="FrameSelection">
            <FrameSelectionNaveBar {...{setPath,setFrame,frame,path}} />
            {
                frame &&
                <div className="FrameSelection-frame">
                    <div  className="FrameSelection-frame-name">
                        {frame.name}
                    </div>
                    <button 
                        className="FrameSelection-frame-add"
                        onClick={handleClick}   
                    >
                        <FontAwesomeIcon icon={faPlusCircle} size="2x" />
                    </button>
                    <img src={frame.dataUrl} />
                </div>
            }
        </div>
    );
}
export default FrameSelection
