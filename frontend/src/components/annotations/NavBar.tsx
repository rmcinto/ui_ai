import "./NavBar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faImage } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { FrameOrFolderState, MetadataState } from "../../types";
import { listDatasets, getImageFile, getMetadataFile } from "../../services/datasetsService";
import DrawerHandle from "./DrawerHandle";

export interface AnnotationNavBarProps {
    setMetadata: React.Dispatch<React.SetStateAction<MetadataState | null | undefined>>;
    setPath: React.Dispatch<React.SetStateAction<string>>;
    path: string;
}

const AnnotationNavBar: React.FC<AnnotationNavBarProps> = ({
    setMetadata,
    setPath,
    path
}) => {
    const [panelWidthPx, setPanelWidth] = useState(250);
    const [contents, setContents] = useState<FrameOrFolderState[]>([]);
    const loadingRef = useRef(false);

    useEffect(() => {
        getPathContents(path);
    }, [path]);

    const getPathContents = async (path: string) => {
        const ext = path.substring(path.lastIndexOf("."));
        if (ext === ".json") {
            const metadata = await getMetadataFile(path);
            const blob = await getImageFile(metadata.frame.path);
            metadata.frame.dataUrl = URL.createObjectURL(blob);
            setMetadata(metadata);
        }
        else {
            const result = await listDatasets(path);
            setContents(result);
            setMetadata(null);
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
                className="AnnotationNaveBar"
                style={{ width: `${panelWidthPx}px` }}
                hidden={panelWidthPx === -1}
            >
                <div
                    className="AnnotationNaveBar-breadcrumbs"
                >
                    <a href="#" onClick={() => setPath("")}>
                        .
                    </a>
                    {path.split("/").map((text, index, arr) =>
                        <span key={index}>
                            <span>&nbsp;/&nbsp;</span>
                            {
                                arr.length - index > 1 &&
                                <a href="#" onClick={() => setPath(arr.slice(0, index + 1).join("/"))}>
                                    {text}
                                </a> ||
                                text
                            }
                        </span>
                    )}
                </div>
                <div className="AnnotationNaveBar-items">
                    {
                        contents.map((content) =>
                            <div
                                key={content.path}
                                tabIndex={0}
                                className="AnnotationNaveBar-item"
                                onClick={() => handleClick(content)}
                                onFocus={() => handleClick(content)}
                            >
                                <FontAwesomeIcon icon={content.isFolder && faFolder || faImage} />
                                {content.path.replace(".json", "")}
                            </div>
                        )
                    }
                </div>
            </div>
            <DrawerHandle sizePx={panelWidthPx} setSize={setPanelWidth} direction="left" />
        </>
    );
}
export default AnnotationNavBar;