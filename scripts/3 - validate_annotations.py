import json
import os

ANNOTATION_ROOT_DIR = os.path.join("data", "annotations")

def find_json_files(root_dir):
    """Recursively find all JSON files in the directory structure."""
    json_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for file in filenames:
            if file.endswith(".json"):
                json_files.append(os.path.join(dirpath, file))
    return json_files

def validate_bounding_box(bbox, annotation_id, file_path):
    """Checks if bounding box is valid."""
    if not isinstance(bbox, dict):
        return f"Annotation {annotation_id} has a missing or malformed bounding box."

    required_keys = ["x", "y", "width", "height"]
    if not all(k in bbox for k in required_keys):
        return f"Annotation {annotation_id} has an incomplete bounding box."

    if not all(isinstance(bbox[k], (int, float)) and bbox[k] >= 0 for k in required_keys):
        return f"Annotation {annotation_id} has invalid bounding box values."

    return None

def validate_parent_child_relationships(annotations, file_path):
    """Ensures that parent-child relationships are valid."""
    errors = []
    id_map = {ann["id"]: ann for ann in annotations}

    for ann in annotations:
        if ann["parent_id"] is not None:
            if ann["parent_id"] not in id_map:
                errors.append(f"Annotation {ann['id']} has a non-existent parent_id {ann['parent_id']}.")

        if "children" in ann:
            for child_id in ann["children"]:
                if child_id not in id_map:
                    errors.append(f"Annotation {ann['id']} has an invalid child reference to {child_id}.")
                elif id_map[child_id]["parent_id"] != ann["id"]:
                    errors.append(f"Annotation {child_id} does not correctly reference its parent {ann['id']}.")

    return errors

def detect_circular_references(annotations, file_path):
    """Detects circular references in the parent-child hierarchy."""
    errors = []
    id_map = {ann["id"]: ann for ann in annotations}

    def find_ancestors(annotation_id, visited):
        """Recursively finds all ancestors of an annotation."""
        if annotation_id in visited:
            return True  # Circular reference detected
        visited.add(annotation_id)
        parent_id = id_map.get(annotation_id, {}).get("parent_id")
        if parent_id is not None:
            return find_ancestors(parent_id, visited)
        return False

    for ann in annotations:
        if find_ancestors(ann["id"], set()):
            errors.append(f"Annotation {ann['id']} has a circular parent-child relationship.")

    return errors

def validate_annotation_file(file_path):
    """Validates a single annotation JSON file and updates it with validation results."""
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Only validate files where "isReady" is true
    if not data.get("isReady", False):
        return None  # Skip validation

    print(f"Processing {file_path}")

    errors = []

    if "annotations" not in data or not isinstance(data["annotations"], list):
        errors.append("Missing or malformed 'annotations' list.")
    else:
        # Validate bounding boxes
        for ann in data["annotations"]:
            bbox_error = validate_bounding_box(ann.get("bounding_box"), ann["id"], file_path)
            if bbox_error:
                errors.append(bbox_error)

        # Validate parent-child relationships
        errors.extend(validate_parent_child_relationships(data["annotations"], file_path))

        # Detect circular references
        errors.extend(detect_circular_references(data["annotations"], file_path))

    # Update JSON file with validation results
    if errors:
        data["validationErrors"] = errors
        data["isValid"] = False
    else:
        data["isValid"] = True
        if "validationErrors" in data:
            del data["validationErrors"]  # Remove any previous errors

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    return errors if errors else None

def validate_annotations():
    """Recursively validates all annotation files in a directory structure."""
    json_files = find_json_files(ANNOTATION_ROOT_DIR)
    all_errors = {}

    for file_path in json_files:
        print(f"Checking {file_path}")
        errors = validate_annotation_file(file_path)
        if errors:
            all_errors[file_path] = errors

    if all_errors:
        for file, errors in all_errors.items():
            print(f"\nErrors in {file}:")
            for error in errors:
                print(" -", error)
    else:
        print("✅ All annotation files are valid.")

if __name__ == "__main__":
    validate_annotations()
