import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Properties.scss';
import Property from "./Property";
import { useState } from 'react';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons/faPlusSquare';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons/faMinusSquare';
import { faEye, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DeleteProperty } from '../../pages/Annotation';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';

export interface PropertiesProps {
    path: string;
    title: string;
    properties: {[key: string]: any;}
    onChange: (path: string, value: any) => void;
    onHeaderClick?: (properties: {[key: string]: any;}, event: React.PointerEvent<HTMLDivElement>) => void;
    level: number;
    canDelete?: boolean;
    canHide?: boolean;
}

const Properties: React.FC<PropertiesProps> = ({
    path,
    title,
    properties,
    level,
    canDelete = false,
    canHide = false,
    onChange,
    onHeaderClick
}) => {
    const [collapse, setCollapse] = useState(true);

    const handleAddClick = () => {
        if (Array.isArray(properties)) {
            const index = properties.length;
            onChange(`${path}.${index}`, "value");
            return;
        }
        let propName = "name";
        let suffix = 0;
        const keys = Object.keys(properties);
        while (keys.includes(propName))
            propName = `${propName}${++suffix}`;
        onChange(`${path}.${propName}`, "value");
    }

    const handleDeleteClick = () => {
        onChange(path, DeleteProperty);
    }

    const handleHideClick = () => {
        onChange(`${path}.hidden`, !properties.hidden);
    }

    return (
        <div
            className="Properties"
            data-level={level}
            style={{
                paddingLeft: `${level * 5}px`
            }}
            onClick={onHeaderClick?.bind(null, properties)}
        >
            <div
                className="Properties-title"
                data-is-selected={!!properties.isSelected}
            >
                <div className="Properties-title-text">{title}</div>
                <div className="Properties-title-toolbar">
                    <FontAwesomeIcon
                        icon={faPlusCircle}
                        size="sm"
                        onClick={handleAddClick}
                    />
                    {
                        canHide &&
                        <FontAwesomeIcon
                            icon={properties.hidden && faEye || faEyeSlash}
                            size="sm"
                            onClick={handleHideClick}
                        />
                    }
                    {
                        canDelete &&
                        <FontAwesomeIcon
                            icon={faTrash}
                            size="sm"
                            onClick={handleDeleteClick}
                        />
                    }
                    <FontAwesomeIcon
                        icon={collapse && faPlusSquare || faMinusSquare}
                        size="lg"
                        onClick={() => setCollapse(!collapse)}
                    />
                </div>

            </div>
            {!collapse && (
                <div
                    className="Properties-items"
                >
                    {
                        Object.keys(properties).map((propName) => {
                            const property = properties.hasOwnProperty(propName)
                                ? properties[propName]
                                : "";

                            if (property && typeof property === "object") {
                                return <Properties
                                    key={propName}
                                    path={`${path}.${propName}`}
                                    title={propName}
                                    properties={property}
                                    onChange={onChange}
                                    level={level + 1}
                                />
                            }
                            else {
                                return <Property
                                    key={propName}
                                    path={`${path}.${propName}`}
                                    propName={propName}
                                    value={property}
                                    isList={Array.isArray(properties)}
                                    onChange={onChange}
                                    style={{
                                        paddingLeft: `${level * 5 + 10}px`
                                    }}
                                />
                            }
                        })
                    }
                </div>
            )}
        </div>
    )
}
export default Properties;