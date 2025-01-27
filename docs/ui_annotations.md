# UI Annotation Format Documentation

This document describes a **JSON-based annotation format** for labeling UI components in single frames extracted from videos (or other image sources). The goal is to capture bounding boxes, styling attributes, hierarchy information, and any custom fields relevant to UI detection or analysis.

---

## Table of Contents

1. [Root-Level Fields](#root-level-fields)  
2. [Annotation Object Fields](#annotation-object-fields)  
   1. [Bounding Box Object](#bounding-box-object)  
   2. [Attributes Object](#attributes-object)  
3. [Full JSON Example](#full-json-example)  
4. [Tips & Best Practices](#tips--best-practices)  
5. [Validation Script Example (Python)](#validation-script-example-python)

---

## Root-Level Fields

| Field         | Type   | Description                                                                                                         |
|---------------|--------|---------------------------------------------------------------------------------------------------------------------|
| `frame_id`    | string | The identifier or filename of the frame being annotated (e.g., `"frame_00042.png"`).                                |
| `annotations` | array  | A list of **annotation objects**, each describing one UI component (e.g., button, text label, field, panel, etc.).  |

**Example**:

```json
{
  "frame_id": "frame_00042.png",
  "annotations": [
    /* array of annotation objects */
  ]
}
```

---

## Annotation Object Fields

Each element in the `annotations` array is an **annotation object**, describing a single UI component and its attributes.

| Field             | Type               | Required? | Description                                                                                                                                                                                                    |
|-------------------|--------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `id`              | integer            | Yes       | A **unique** identifier for the component (unique within this frame).                                                                                                                                          |
| `parent_id`       | integer \| null   | Yes       | Identifies the parent component if this element is nested. Use `null` if the component has no parent (e.g., a main window).                                                                                    |
| `component_type`  | string             | Yes       | A label or class for the component (e.g., `"Window"`, `"Panel"`, `"Button"`, `"TextLabel"`, `"TextField"`, etc.).                                                                                              |
| `bounding_box`    | object             | Yes       | Coordinates and size describing where this UI component is located in the image, typically stored as `(x, y, width, height)` or `(x_min, y_min, x_max, y_max)`.                                                |
| `attributes`      | object (flexible)  | No        | An open-ended object containing style, text, or other metadata about the component (e.g., color, border, text content, font).                                                                                  |
| `children`        | array of integers  | Yes       | A list of **child component IDs** that live inside this component. If there are no children, this can be an empty array.                                                                                       |

---

### Bounding Box Object

You can store bounding box coordinates in one of two common ways:

1. **`(x, y, width, height)`** – where `(x, y)` is the top-left corner and `width` / `height` specify the dimensions.  
2. **`(x_min, y_min, x_max, y_max)`** – where `(x_min, y_min)` is the top-left corner and `(x_max, y_max)` is the bottom-right corner.

Choose **one** approach and remain consistent.

**Example** (`x, y, width, height`):

```json
"bounding_box": {
  "x": 600,
  "y": 70,
  "width": 100,
  "height": 40
}
```

---

### Attributes Object

- **Purpose**: Store styles, text content, and any additional data needed for your use case—such as color, border, text content, placeholder text, transitions, etc.  
- **Structure**: Flexible and open-ended. You can add or remove fields based on project requirements.

**Example**:

```json
"attributes": {
  "color": "#0078D4",
  "border": "1px solid #005A9E",
  "text": "OK",
  "additional_styles": {
    "font_family": "Segoe UI",
    "font_size": "14px"
  }
}
```

Feel free to add fields like `"hover_state": true` or `"transition_effect": "fade-in"` if those are relevant.

---

## Full JSON Example

Below is a **complete example** for a single frame, illustrating a window containing a panel, a button, and a text field. Notice how the `id`, `parent_id`, and `children` fields reference each other to show a nested hierarchy.

```json
{
  "frame_id": "frame_00042.png",
  "annotations": [
    {
      "id": 1,
      "parent_id": null,
      "component_type": "Window",
      "bounding_box": {
        "x": 0,
        "y": 0,
        "width": 1920,
        "height": 1080
      },
      "attributes": {
        "color": "#FFFFFF",
        "border": "none",
        "text": "",
        "additional_styles": {}
      },
      "children": [2, 3]
    },
    {
      "id": 2,
      "parent_id": 1,
      "component_type": "Panel",
      "bounding_box": {
        "x": 50,
        "y": 50,
        "width": 500,
        "height": 300
      },
      "attributes": {
        "color": "#F0F0F0",
        "border": "1px solid #CCCCCC",
        "text": "",
        "additional_styles": {}
      },
      "children": [4]
    },
    {
      "id": 3,
      "parent_id": 1,
      "component_type": "Button",
      "bounding_box": {
        "x": 600,
        "y": 70,
        "width": 100,
        "height": 40
      },
      "attributes": {
        "color": "#0078D4",
        "border": "1px solid #005A9E",
        "text": "OK",
        "additional_styles": {
          "font_family": "Segoe UI",
          "font_size": "14px"
        }
      },
      "children": []
    },
    {
      "id": 4,
      "parent_id": 2,
      "component_type": "TextField",
      "bounding_box": {
        "x": 60,
        "y": 80,
        "width": 200,
        "height": 30
      },
      "attributes": {
        "color": "#FFFFFF",
        "border": "1px solid #CCCCCC",
        "text": "Enter name",
        "additional_styles": {}
      },
      "children": []
    }
  ]
}
```

### Key Observations

- **`id`**: A unique integer identifier (e.g., 1 for the window, 2 for the panel, etc.).  
- **`parent_id`**: `null` for the root (the main window). Nested components have their parent’s ID (e.g., panel has `parent_id: 1`).  
- **`children`**: Lists the IDs of any child components. The main window has `[2, 3]`, indicating it contains the panel and button.  
- **`component_type`**: Strings describing each UI element type (`"Window"`, `"Panel"`, `"Button"`, `"TextField"`, etc.).  
- **`bounding_box`**: (`x`, `y`, `width`, `height`) for each component, referencing the top-left corner of the frame.  
- **`attributes`**: Contains visual styling, text content, or other metadata. Can be as detailed as needed.

---

## Tips & Best Practices

1. **Consistency**  
   - Use the same coordinate format across your dataset (e.g., always `(x, y, width, height)`).
   - Keep component type naming consistent (e.g., `"Button"` vs. `"button"`).

2. **Hierarchy**  
   - Ensure `parent_id` and `children` references match up correctly (no circular references).
   - Use `null` for root elements that have no parent.

3. **Extensibility**  
   - Add fields for interactive states (e.g., `"hovered": true`) or transitions (e.g., `"transition_effect": "fade-in"`).
   - Store text content if it’s displayed (e.g., `"text": "OK"` for a button).

4. **Validation**  
   - Write or use a script to confirm that bounding boxes have positive width/height and that IDs align.  
   - Check that references between `parent_id` and `children` are correct.

5. **Integration**  
   - Most object detection frameworks (e.g., PyTorch, TensorFlow) require a custom data loader or data conversion step.  
   - A stable JSON structure simplifies the conversion to those frameworks.

---

## Validation Script Example (Python)

Below is a minimal Python script to **validate** and **parse** an annotation file. Save it as `validate_annotations.py` and run it with Python 3.

```python
import json
import os

def validate_annotations(json_path):
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"File '{json_path}' not found.")

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Check root-level fields
    if 'frame_id' not in data:
        raise ValueError("Missing 'frame_id' in JSON.")
    if 'annotations' not in data:
        raise ValueError("Missing 'annotations' array in JSON.")

    for annotation in data['annotations']:
        # Check required fields
        if 'id' not in annotation:
            raise ValueError("Annotation missing 'id'.")
        if 'parent_id' not in annotation:
            raise ValueError(f"Annotation {annotation.get('id', '?')} missing 'parent_id'.")
        if 'component_type' not in annotation:
            raise ValueError(f"Annotation {annotation.get('id', '?')} missing 'component_type'.")
        if 'bounding_box' not in annotation:
            raise ValueError(f"Annotation {annotation.get('id', '?')} missing 'bounding_box'.")
        if 'children' not in annotation:
            raise ValueError(f"Annotation {annotation.get('id', '?')} missing 'children' list.")

        # Check bounding_box validity
        bbox = annotation['bounding_box']
        required_bbox_keys = ['x', 'y', 'width', 'height']
        for key in required_bbox_keys:
            if key not in bbox:
                raise ValueError(
                    f"Annotation {annotation.get('id', '?')} bounding_box missing '{key}'."
                )

        if bbox['width'] <= 0 or bbox['height'] <= 0:
            raise ValueError(
                f"Annotation {annotation.get('id', '?')} has non-positive width/height."
            )

        # Optionally, check attributes if you want specific fields
        if 'attributes' in annotation:
            # Perform additional checks on attributes if necessary
            pass
    
    print("All annotations look valid!")

if __name__ == "__main__":
    try:
        validate_annotations("frame_annotations.json")
    except Exception as e:
        print("Validation failed:", str(e))
    else:
        print("Validation succeeded!")
```

**How It Works**:

1. Loads your JSON file.  
2. Ensures required fields exist (`frame_id`, `annotations`, etc.).  
3. Checks each annotation for required keys (`id`, `parent_id`, `bounding_box`, etc.).  
4. Validates bounding boxes for positive dimensions.  
5. Optionally checks attributes for domain-specific constraints.

---

## Conclusion

This **UI Annotation JSON Format** provides a clear and extensible way to store bounding box coordinates, component hierarchy, and visual attributes for UI elements in a single frame. By keeping the structure consistent, you set a strong foundation for downstream tasks such as object detection, style analysis, and automated UI understanding.