import './DrawerHandle.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import { useEffect, useRef, useState } from "react";
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

export interface DrawerHandleProps {
    sizePx: number;
    setSize: React.Dispatch<React.SetStateAction<number>>;
    direction?: "left" | "right";
}

const DrawerHandle: React.FC<DrawerHandleProps> = ({
    sizePx,
    setSize,
    direction = "right"
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const lastPositionRef = useRef(0);
    const lastSize = useRef(sizePx);

    useEffect(() => {
        if (!isResizing)
            lastPositionRef.current = 0;
    }, [isResizing]);

    useEffect(() => {
        if (collapsed) {
            lastSize.current = sizePx;
            setSize(-1);
        }
        else {
            setSize(lastSize.current);
        }
    }, [collapsed]);

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isResizing || collapsed)
            return;
        const { clientX } = event;
        const lastX = lastPositionRef.current;
        //skip the first movement so we can capture the coordinates
        if (lastX === 0) {
            lastPositionRef.current = clientX;
            return;
        }
        const deltaX = clientX - lastPositionRef.current;
        let newWidth = direction === "right"
            ? sizePx - deltaX
            : sizePx + deltaX;

        setSize(newWidth);
        lastPositionRef.current = clientX;
    }

    return (
        <div
            className="DrawerHandle"
            onPointerDown={() => setIsResizing(true)}
            onPointerUp={() => setIsResizing(false)}
            onPointerMove={handlePointerMove}
            data-is-resizing={isResizing}
            data-is-collapsed={collapsed}
            data-direction={direction}
        >
            <Button
                className="DrawerHandle-button"
                onClick={() => setCollapsed(!collapsed)}
            >
                <FontAwesomeIcon icon={collapsed && faPlusSquare || faMinusSquare} />
            </Button>
        </div>
    )
}
export default DrawerHandle;