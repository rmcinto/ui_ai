import './PropertiesPanel.scss';
import { MetadataState } from "../../types";
import KeywordsPanel from "./KeywordsPanel";
import Properties from "./Properties";
import { useState } from 'react';
import DrawerHandle from './DrawerHandle';
import ProcessPanel from './ProcessPanel';
import AnnotationsPanel from './AnnotationsPanel';

export interface PropertiesPanelProps {
    metadata: MetadataState;
    onChange: (path: string, value: any) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
    metadata,
    onChange
}) => {
    const [panelWidthPx, setPanelWidth] = useState(250);

    return (
        <>
            <DrawerHandle sizePx={panelWidthPx} setSize={setPanelWidth} />
            <div
                className="PropertiesPanel"
                style={{ width: `${panelWidthPx}px` }}
                hidden={panelWidthPx === -1}
            >
                <ProcessPanel 
                    metadata={metadata}
                    onChange={onChange}
                />
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
                <AnnotationsPanel 
                    annotations={metadata.annotations}
                    onChange={onChange}
                />
            </div>
        </>
    )
}
export default PropertiesPanel;