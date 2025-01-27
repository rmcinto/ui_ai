import "./NavBar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faImage } from "@fortawesome/free-solid-svg-icons";
import { getImageFile, listFrameContents } from "../../services/framesService";
import { useEffect, useRef, useState } from "react";
import { FrameState, FrameOrFolderState } from "../../types";
import DrawerHandle from "../annotations/DrawerHandle";

export interface FrameSelectionNaveBarProps {
    setFrame: React.Dispatch<React.SetStateAction<FrameState | null | undefined>>;
    setPath: React.Dispatch<React.SetStateAction<string>>;
    path: string;
    frame: FrameState | null | undefined;
}

const FrameSelectionNaveBar: React.FC<FrameSelectionNaveBarProps> = ({
    setFrame,
    setPath,
    path,
    frame
}) => {
    const [contents, setContents] = useState<FrameOrFolderState[]>([]);
    const [panelWidthPx, setPanelWidth] = useState(250);
    const loadingRef = useRef(false);
    
    useEffect(()=> {
        getPathContents(path);
    }, [path]);

    useEffect(()=> {
        if (!frame)
            getPathContents(path);
    }, [frame]);

    const getPathContents = async (path: string) => {
        const ext = path.substring(path.lastIndexOf("."));
        if ([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"].includes(ext)) {
            const blob = await getImageFile(path);
            setFrame({
                name: path.substring(path.lastIndexOf("/")),
                path,
                dataUrl: URL.createObjectURL(blob)
            });
        }
        else {
            const result = await listFrameContents(path);
            setContents(result);
        }
    }

    const handleClick = (item: FrameOrFolderState) => {
        if (loadingRef.current)
            return;
        loadingRef.current = true;

        const nextPath = path
            ? `${path}/${item.path}`
            : item.path;
            
        if (item.isFolder) {
            setPath(nextPath);
        }
        else {
            getPathContents(nextPath);
        }
        
        loadingRef.current = false;
    }

    return (
        <>
            <div 
                className="FrameSelectionNaveBar"
                style={{ width: `${panelWidthPx}px` }}
                hidden={panelWidthPx === -1}
            >
                <div 
                    className="FrameSelectionNaveBar-breadcrumbs"
                >
                    <a href="#" onClick={()=> setPath("")}>
                        .
                    </a>
                    {path.split("/").map((text, index, arr)=> 
                        <span key={index}>
                            <span>&nbsp;/&nbsp;</span>
                            {
                                arr.length - index > 1 &&
                                <a onClick={()=> setPath(arr.slice(0, index + 1).join("/"))}>
                                    {text}
                                </a> ||
                                text
                            }
                        </span>
                    )}
                </div>
                <div className="FrameSelectionNaveBar-items">
                    {
                        contents.map((content)=>
                            <div
                                key={content.path}
                                tabIndex={0}
                                className="FrameSelectionNaveBar-item"
                                onClick={()=> handleClick(content)}
                                onFocus={()=> handleClick(content)}
                            >
                                <FontAwesomeIcon icon={content.isFolder && faFolder || faImage} />
                                {content.path}
                            </div>
                        )
                    }
                </div>
            </div>
            <DrawerHandle sizePx={panelWidthPx} setSize={setPanelWidth} direction="left" />
        </>
    );
}
export default FrameSelectionNaveBar;