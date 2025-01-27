import "./BoundingBox.scss";
import { useEffect, useRef, useState } from "react";
import { AnnotationState, BoundingBoxState, GrowthState } from "../../types";

type ActionType = "none" | "move" | "top" | "bottom" | "left" | "right" | "top-left" | "bottom-left" | "top-right" | "bottom-right";

interface Position {
    x: number;
    y: number;
}

export interface BoundingBoxProps {
    path: string;
    annotation: AnnotationState;
    growth: GrowthState;
    onChange: (path: string, value: any) => void;
}

const BoundingBox: React.FC<BoundingBoxProps> = ({
    path,
    annotation,
    growth,
    onChange
}) => {
    const [actionType, setActionType] = useState<ActionType>("none");
    const pointerPosition = useRef<Position | null>(null);
    const lastMove = useRef<number>(0);
    const [boundingBox, setBoundingBox] = useState<BoundingBoxState>(annotation.bounding_box);
    const [performedAction, setPerformedAction] = useState(false);

    useEffect(() => {
        setInternalBox(annotation.bounding_box);
    }, [growth]);

    useEffect(()=> {
        const cur = JSON.stringify(boundingBox);
        const box = getInternalBox(annotation.bounding_box);
        const next = JSON.stringify(box);
        if (cur !== next)
            setInternalBox(annotation.bounding_box);
    });

    const getInternalBox = (boundingBox: BoundingBoxState)=> {
        const updatedBoundingBox = { ...boundingBox };
    
        updatedBoundingBox.x = updatedBoundingBox.x * growth.x;
        updatedBoundingBox.width = updatedBoundingBox.width * growth.x;
        updatedBoundingBox.y = updatedBoundingBox.y * growth.y;
        updatedBoundingBox.height = updatedBoundingBox.height * growth.y;

        return updatedBoundingBox;
    }

    const setInternalBox = (boundingBox: BoundingBoxState)=> {
        setBoundingBox(getInternalBox(boundingBox));
    }

    const handlePointerDown = (event: React.PointerEvent) => {
        const el = (event.target as HTMLElement);

        const action = el.className === "BoundingBox"
            ? "move"
            : el.classList[2].replace("BoundingBox-", "");
        pointerPosition.current = { x: event.clientX, y: event.clientY };
        setActionType(action as ActionType);
    }

    const handlePointerUp = () => {
        setActionType("none");
        if (!performedAction)
            onChange(`${path}.isSelected`, !annotation.isSelected);
        setPerformedAction(false);
    }

    const handlePointerMove = (event: React.PointerEvent) => {
        if (actionType === "none")
            return;

        if (performance.now() - lastMove.current < 50) {
            return;
        }

        event.preventDefault();

        const pointerX = event.clientX;
        const pointerY = event.clientY;

        if (!pointerPosition.current) {
            pointerPosition.current = { x: event.clientX, y: event.clientY };
            return;
        }

        const deltaX = Math.round((pointerX - pointerPosition.current.x) / growth.x);
        const deltaY = Math.round((pointerY - pointerPosition.current.y) / growth.y);

        const updatedBoundingBox = { ...annotation.bounding_box };

        // Adjust the bounding box based on the action type
        switch (actionType) {
            case "left":
                updatedBoundingBox.x += deltaX;
                updatedBoundingBox.width -= deltaX;
                break;
            case "right":
                updatedBoundingBox.width += deltaX;
                break;
            case "top":
                updatedBoundingBox.y += deltaY;
                updatedBoundingBox.height -= deltaY;
                break;
            case "top-left":
                updatedBoundingBox.y += deltaY;
                updatedBoundingBox.height -= deltaY;
                updatedBoundingBox.x += deltaX;
                updatedBoundingBox.width -= deltaX;
                break;
            case "top-right":
                updatedBoundingBox.y += deltaY;
                updatedBoundingBox.height -= deltaY;
                updatedBoundingBox.width += deltaX;
                break;
            case "bottom":
                updatedBoundingBox.height += deltaY;
                break;
            case "bottom-right":
                updatedBoundingBox.height += deltaY;
                updatedBoundingBox.width += deltaX;
                break;
            case "bottom-left":
                updatedBoundingBox.height += deltaY;
                updatedBoundingBox.x += deltaX;
                updatedBoundingBox.width -= deltaX;
                break;
            case "move":
                updatedBoundingBox.x += deltaX;
                updatedBoundingBox.y += deltaY;
                break;
        }

        // Update the state via onChange
        onChange(`$.annotations.${annotation.id - 1}.bounding_box`, updatedBoundingBox);
        setInternalBox(updatedBoundingBox);
        pointerPosition.current = { x: event.clientX, y: event.clientY };
        setPerformedAction(true);
        lastMove.current = performance.now();
    }

    return (
        <div
            className="BoundingBox"
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            style={{
                left: `${boundingBox.x}px`,
                top: `${boundingBox.y}px`,
                width: `${boundingBox.width}px`,
                height: `${boundingBox.height}px`,
                borderColor: annotation.isSelected
                    ? `${annotation.color}55`
                    : annotation.color,
                backgroundColor: annotation.isSelected 
                    ? `${annotation.color}55`
                    : "unset",
                display: annotation.hidden 
                    ? "none" 
                    : "unset"
            }}
        >
            <div className="BoundingBox-mask" hidden={actionType === "none"}></div>
            <div className="BoundingBox-handle BoundingBox-edge-horiz BoundingBox-top"></div>
            <div className="BoundingBox-handle BoundingBox-edge-horiz BoundingBox-bottom"></div>
            <div className="BoundingBox-handle BoundingBox-edge-vert BoundingBox-left"></div>
            <div className="BoundingBox-handle BoundingBox-edge-vert BoundingBox-right"></div>
            <div className="BoundingBox-handle BoundingBox-corner BoundingBox-top-left"></div>
            <div className="BoundingBox-handle BoundingBox-corner BoundingBox-top-right"></div>
            <div className="BoundingBox-handle BoundingBox-corner BoundingBox-bottom-left"></div>
            <div className="BoundingBox-handle BoundingBox-corner BoundingBox-bottom-right"></div>
        </div>
    );
}
export default BoundingBox;