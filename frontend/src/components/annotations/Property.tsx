import "./Property.scss";
import { CSSProperties } from "react";
import { DeleteProperty } from "../../pages/Annotation";

export interface PropertyProps {
    path: string;
    propName: string;
    value: any;
    isList?: boolean;
    onChange: (path: string, value: any) => void;
    style?: CSSProperties;
}

const noPropNameUpdate = [
    "id",
    "parent_id",
    "component_type",
    "width",
    "height",
    "x",
    "y"
]

const Property: React.FC<PropertyProps> = ({
    path,
    propName,
    value,
    isList = false,
    onChange,
    style
}) => {

    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        const el = event.target as HTMLInputElement;
        if (el.type === "checkbox")
            onChange?.(path, event.currentTarget.checked)
        else
            onChange?.(path, event.currentTarget.value)
    }

    return (
        <div 
            className="Property"
            style={style}
        >
            <label 
                className="Property-label"
                contentEditable={!noPropNameUpdate.includes(propName)}
                suppressContentEditableWarning
                onBlur={(event)=> {
                    const newProp = (event.target as HTMLElement).innerText;
                    if (newProp === propName){
                        return;
                    }

                    onChange(path, DeleteProperty);
                    if (!newProp.replace(/^[\n ]+$/, "")) {
                        return;
                    }

                    const newPath = path.replace(propName, newProp);
                    onChange(newPath, value);
                }}
            >
                {!isList && propName || ""}
            </label>
            <input 
                className="Property-input"
                type={
                    typeof value === "boolean"
                    ? "checkbox"
                    : /^[#][0-9abcdefABCDEF]{6,8}$/.test(value) 
                        ? "color"
                        : /^[0-9]+(?:[.][0-9]+)?$/.test(value)
                            ? "number"
                            : "text" 
                }
                value={
                    value === null 
                    ? "" 
                    : value
                }
                checked={value}
                onChange={handleChange}
            />
        </div>
    );
}
export default Property;