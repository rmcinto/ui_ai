import './PropertiesPanel.scss';
import { AnnotationState, initialAnnotation, MetadataState } from "../../types";
import KeywordsPanel from "./KeywordsPanel";
import Properties from "./Properties";
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import DrawerHandle from './DrawerHandle';

export interface PropertiesPanelProps {
    metadata: MetadataState;
    onChange: (path: string, value: any) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
    metadata,
    onChange
}) => {
    const [panelWidthPx, setPanelWidth] = useState(250);

    const handleAddClick = () => {
        const annotation = JSON.parse(JSON.stringify(initialAnnotation));
        annotation.id = metadata.annotations.reduce((max, obj) => Math.max(max, obj.id), -Infinity) + 1;
        
        const index = metadata.annotations.length;
        onChange(`$.annotations.${index}`, annotation);
    }

    const getAnnotationTitle = (annotation: AnnotationState): string => {
        const name = annotation.name
            ? annotation.name
            : "Annotation";
        const parentId = annotation.parent_id
            ? ` [${annotation.parent_id}]`
            : "";
        return`{${annotation.id}}${parentId} ${name}`;
    }

    const handleHeaderClick = (properties: {[key:string]: any}, event: React.PointerEvent<HTMLDivElement>) => {
        const target = (event.target as HTMLElement);
        
        if (!target.classList.contains("Properties-title-text"))
            return;

        const annotation = (properties as AnnotationState);
        const index = metadata.annotations.indexOf(annotation);

        onChange(`$.annotations.${index}.isSelected`, !annotation.isSelected);
    }

    return (
        <>
            <DrawerHandle sizePx={panelWidthPx} setSize={setPanelWidth} />
            <div
                className="PropertiesPanel"
                style={{ width: `${panelWidthPx}px` }}
                hidden={panelWidthPx === -1}
            >
                <KeywordsPanel
                    path="$.keywords"
                    keywords={metadata.keywords}
                    onChange={onChange}
                />
                <Properties
                    path="$.frame"
                    title="Frame Properties"
                    properties={metadata.frame}
                    onChange={onChange}
                    level={0}
                />
                <div className="PropertiesPanel-annotations">
                    <div>Annotations</div>
                    <Button onClick={handleAddClick}>
                        <FontAwesomeIcon icon={faPlusCircle} />
                    </Button>
                </div>
                {
                    metadata.annotations.map((annotation, index) =>
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
        </>
    )
}
export default PropertiesPanel;