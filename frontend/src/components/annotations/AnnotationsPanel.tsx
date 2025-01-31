import "./AnnotationsPanel.scss";
import React, { useEffect, useRef, useState } from "react";
import { AnnotationState, initialAnnotation } from "../../types";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons/faPlusCircle";
import Properties from "./Properties";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons/faPlusSquare";
import { faMinusSquare } from "@fortawesome/free-solid-svg-icons/faMinusSquare";

export interface AnnotationPanelProps {
    annotations: AnnotationState[];
    onChange: (path: string, value: any) => void;
}

const AnnotationsPanel: React.FC<AnnotationPanelProps> = ({
    annotations,
    onChange
}) => {
    const [collapse, setCollapse] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [itemHeight] = useState(38);
    const [currentItem, setCurrentItem] = useState(0);
    const [visibleItemCount, setVisibleItemCount] = useState(0);
    const [visibleItems, setVisibleItems] = useState<AnnotationState[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const visibleItemCount = Math.ceil(entry.contentRect.height / itemHeight);
                setVisibleItemCount(visibleItemCount + 1);
                setVisibleItems(
                    annotations.slice(
                        currentItem, 
                        visibleItemCount
                    )
                );
            }
        });
        observer.observe(containerRef.current);
        return () => {
            observer.disconnect();
        };
    }, [collapse]);

    const handleAddClick = () => {
        const annotation = JSON.parse(JSON.stringify(initialAnnotation));
        annotation.id = annotations.reduce((max, obj) => Math.max(max, obj.id), -Infinity) + 1;

        const index = annotations.length;
        onChange(`$.annotations.${index}`, annotation);
    }

    const getAnnotationTitle = (annotation: AnnotationState): string => {
        const name = annotation.name
            ? annotation.name
            : "Annotation";
        const parentId = annotation.parent_id
            ? ` [${annotation.parent_id}]`
            : "";
        return `{${annotation.id}}${parentId} ${name}`;
    }

    const handleHeaderClick = (properties: { [key: string]: any }, event: React.PointerEvent<HTMLDivElement>) => {
        const target = (event.target as HTMLElement);

        if (!target.classList.contains("Properties-title-text"))
            return;

        const annotation = (properties as AnnotationState);
        const index = annotations.indexOf(annotation);

        onChange(`$.annotations.${index}.isSelected`, !annotation.isSelected);
    }

    const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = event.target as HTMLDivElement;
        const firstItem = Math.floor(target.scrollTop / itemHeight);
        const items = annotations.slice(firstItem, firstItem + visibleItemCount);
        setCurrentItem(firstItem);
        setVisibleItems(items);
    }

    return (
        <div className="AnnotationsPanel">
            <div className="AnnotationsPanel-title">
                <div>Annotations</div>
                <Button onClick={handleAddClick}>
                    <FontAwesomeIcon icon={faPlusCircle} />
                </Button>
                <FontAwesomeIcon
                    icon={collapse && faPlusSquare || faMinusSquare}
                    size="lg"
                    onClick={() => setCollapse(!collapse)}
                />
            </div>
            {!collapse &&
                <div
                    className="AnnotationsPanel-items"
                    onScrollCapture={handleScroll}
                    ref={containerRef}
                >
                    <div
                        className="AnnotationsPanel-items-container"
                        style={{
                            top: `${(itemHeight * currentItem)}px`,
                            height: `${itemHeight * (annotations.length - currentItem)}px`
                        }}
                    >
                        {
                            visibleItems.map((annotation, index) =>
                                <Properties
                                    key={annotation.id}
                                    path={`$.annotations.${index}`}
                                    title={getAnnotationTitle(annotation)}
                                    properties={annotation}
                                    onChange={onChange}
                                    onHeaderClick={handleHeaderClick}
                                    level={0}
                                    canDelete={true}
                                    canHide={true}
                                />
                            )
                        }
                    </div>
                </div>
            }
        </div>
    );
}
export default AnnotationsPanel;