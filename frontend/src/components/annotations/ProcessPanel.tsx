import './ProcessPanel.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import { MetadataState } from '../../types';
import Property from './Property';

export interface ProcessPanelProps {
    metadata: MetadataState;
    onChange: (path: string, value: any) => void;
}

const ProcessPanel: React.FC<ProcessPanelProps> = ({
    metadata,
    onChange
}) => {
    const [collapse, setCollapse] = useState(false);

    return (
        <div className="ProcessPanel">
            <div className="ProcessPanel-title">
                <div>Process Control</div>
                <FontAwesomeIcon 
                    icon={collapse && faPlusSquare || faMinusSquare} 
                    size="lg" 
                    onClick={()=> setCollapse(!collapse)} 
                />
            </div>
            <div 
                className="ProcessPanel-items"
                hidden={collapse}
            >
                <Property
                    path="$.isReady"
                    propName="isReady"
                    value={metadata.isReady}
                    onChange={onChange}
                    style={{
                        paddingLeft: `10px`
                    }}
                />
                <Property
                    path="$.isValid"
                    propName="isValid"
                    value={metadata.isValid}
                    onChange={onChange}
                    style={{
                        paddingLeft: `10px`
                    }}
                />
                <Property
                    path="$.isProcessed"
                    propName="isProcessed"
                    value={metadata.isProcessed}
                    onChange={onChange}
                    style={{
                        paddingLeft: `10px`
                    }}
                />
            </div>
        </div>
    )
}
export default ProcessPanel;