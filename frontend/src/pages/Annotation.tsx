import "./Annotation.scss";
import { useEffect, useRef, useState } from 'react'
import NavBar from "../components/annotations/NavBar";
import PropertiesPanel from "../components/annotations/PropertiesPanel";
import { GrowthState, MetadataState } from "../types";
import FrameCanvas from "../components/annotations/FrameCanvas";
import Overlay from "../components/annotations/Overlay";
import { updateAnnotations } from "../services/datasetsService";

export const DeleteProperty = Symbol("DeleteProperty");

let isSaving: any = false;

function Annotation() {
    const [path, setPath] = useState("");
    const [metadata, setMetadata] = useState<MetadataState | null>();
    const [metaInit, setMetaInit] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);
    const [frameSize, setFrameSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
    const [growth, setGrowth] = useState<GrowthState>({ x: 1, y: 1 });
    const [mousePosition, setMousePosition] = useState<{ x: Number, y: number }>({ x: 0, y: 0 });
    const zoomScaleRef = useRef(0);
    const mainRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!mainRef.current)
            return;
        if (!metadata) {
            setMetaInit(false);
            return;
        }
        if (!metaInit) {
            setZoomScale(metadata.frame.width!);
            setMetaInit(true);
        }
        mainRef.current.addEventListener("wheel", handleWheel, { passive: false });
        return () => mainRef.current?.removeEventListener("wheel", handleWheel);
    }, [metadata]);

    useEffect(() => {
        if (!metadata)
            return;
        const frame = metadata.frame;
        const frameWidth = frame.width! + zoomScale;
        const frameHeight = frame.height! / frame.width! * frameWidth;
        const horizGrowth = frameWidth / frame.width!;
        const vertGrowth = frameHeight / frame.height!;
        const growth = { x: horizGrowth, y: vertGrowth };
        setGrowth(growth);
        setFrameSize({
            width: Math.round(frameWidth),
            height: Math.round(frameHeight)
        });

    }, [zoomScale]);

    const handleChange = async (path: string, value: any) => {
        if (!metadata)
            return;
        const segs = path.split(".");
        segs.shift();
        let scope = metadata;
        const lastindex = segs.length - 1;
        for (let i = 0; i <= lastindex; i++) {
            const key = segs[i];
            if (i === lastindex) {
                if (value === DeleteProperty) {
                    if (Array.isArray(scope)) {
                        scope.splice(scope.indexOf(scope[key]), 1);
                    }
                    else {
                        delete scope[key];
                    }
                }
                else if (scope[key] != value) {
                    if (value?.match && value.match(/^[0-9]+[.][0-9]+$/)) {
                        scope[key] = parseFloat(value);
                    }
                    else if (value?.match && value.match(/^[0-9]+$/)) {
                        scope[key] = parseInt(value);
                    }
                    else if (value === "true") {
                        scope[key] = true;
                    }
                    else if (value === "false") {
                        scope[key] = false;
                    }
                    else {
                        scope[key] = value;
                    }
                }
                else {
                    return;
                }
            }
            else {
                if (!scope.hasOwnProperty(key)) {
                    //if the next key is numeric assume array
                    if (segs[i + 1]?.match(/^[0-9]+$/)) {
                        scope[key] = [];
                    }
                    else {
                        scope[key] = {};
                    }
                }
                scope = scope[key];
            }
        }

        let match: RegExpMatchArray | null;
        if ((match = path.match(/^[$][.]annotations[.]([0-9]+)[.]isSelected/)) && value === true) {
            const index = parseInt(match[1]);
            const annotation = metadata.annotations[index];
            const annotationId = annotation.id;
            //deselect all other annotations
            for (let annotation of Object.values(metadata.annotations)) {
                if (annotation.id !== annotationId) 
                    annotation.isSelected = false;
            }
        }

        console.log(path, value)

        setMetadata({ ...metadata });
        save(metadata);
    }

    const save = async (metadata: MetadataState) => {
        if (isSaving) {
            isSaving = metadata;
            return;
        }
        isSaving = true;

        await updateAnnotations(`${path}/${metadata.name}.json`, metadata);

        if (isSaving === true) {
            isSaving = false;
            return;
        }

        metadata = isSaving;
        isSaving = false;
        save(metadata);
    }

    const handleWheel = (event: WheelEvent) => {
        if (!metadata)
            return;
        if (!event.ctrlKey)
            return;
        event.preventDefault();
        let interval = 0.1;
        if (event.shiftKey)
            interval = 0.5;
        // Adjust zoom scale based on scroll direction, allowing negative values
        const newZoomScale = zoomScaleRef.current - event.deltaY * interval;
        setZoomScale(newZoomScale);
        zoomScaleRef.current = newZoomScale;
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!mainRef.current)
            return;

        const container = mainRef.current as HTMLElement;
        const target = event.currentTarget; // The element the event is bound to
        const rect = target.getBoundingClientRect();

        let x = (event.clientX - rect.left + container.scrollLeft) / growth.x; // Adjusting for scroll
        let y = (event.clientY - rect.top + container.scrollTop) / growth.y;  // Adjusting for scroll

        setMousePosition({ x, y });
    }

    return (
        <div className="Annotation">
            <NavBar {...{ setMetadata, setPath, path }} />
            {
                metadata &&
                <>
                    <div className="Annotation-main">
                        <div
                            className="Annotation-main-canvas"
                            onPointerMove={handlePointerMove}
                            ref={mainRef}
                        >
                            <FrameCanvas
                                frame={metadata.frame}
                                style={{
                                    width: `${frameSize?.width}px`,
                                    height: `${frameSize?.height}px`
                                }}
                            />
                            <Overlay
                                metadata={metadata}
                                growth={growth}
                                style={{
                                    width: `${frameSize?.width}px`,
                                    height: `${frameSize?.height}px`
                                }}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="Annotation-main-status">
                            mouse:&nbsp;
                            x: {mousePosition.x.toFixed(0)}&nbsp;
                            y: {mousePosition.y.toFixed(0)}&nbsp;&nbsp;
                            size:&nbsp;
                            width: {frameSize.width}&nbsp;
                            height: {frameSize.height}&nbsp;&nbsp;
                            zoom: {(metadata.frame.width! / frameSize.width * 100).toFixed(0)}&nbsp;&nbsp;
                            growth:&nbsp;
                            x: {parseFloat(growth.x.toFixed(4))}&nbsp;
                            y: {parseFloat(growth.y.toFixed(4))}&nbsp;
                        </div>
                    </div>
                    <PropertiesPanel
                        metadata={metadata}
                        onChange={handleChange}
                    />
                </>
            }
        </div>
    );
}

export default Annotation
