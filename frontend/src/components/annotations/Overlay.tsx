import "./Overlay.scss";
import { GrowthState, MetadataState } from "../../types";
import BoundingBox from "./BoundingBox";
import { HTMLProps } from "react";

export interface OverlayProps extends Omit<HTMLProps<HTMLDivElement>, 'onChange'> {
    metadata: MetadataState;
    growth: GrowthState;
    onChange: (path: string, value: any) => void;
}

const Overlay: React.FC<OverlayProps> = ({
    metadata,
    growth,
    style, 
    onChange
}) => {

    return (
        <div 
            className="Overlay"
            style={style}
        >
            {metadata.annotations.map((annotation, index) => 
                <BoundingBox 
                    key={annotation.id}
                    path={`$.annotations.${index}`}
                    annotation={annotation}
                    growth={growth}
                    onChange={onChange}
                />
            )}
        </div>
    );
};

export default Overlay;