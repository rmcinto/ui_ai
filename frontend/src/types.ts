/**
 * types.ts
 * Shared TypeScript type definitions for our UI annotation tool.
 */

export interface FrameOrFolderState {
  path: string
  isFolder: boolean
}

export interface FrameState {
    name: string;
    path: string;
    dataUrl: string;
    width?: number;
    height?: number;
}

export interface MetadataState {
    [key: string]: any;
    name: string;
    keywords: string[];
    frame: FrameState;
    annotations: AnnotationState[];
}

export interface BoundingBoxState {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const initialBoundingBox: BoundingBoxState = {
    x: 200,
    y: 200,
    width: 200,
    height: 200
}

export interface AnnotationState {
    id: number;
    name: string;
    parent_id: number | null;
    component_type: string;
    bounding_box: BoundingBoxState;
    color: string;
    isSelected: boolean;
    hidden: boolean;
    attributes: {[key: string]: any};
    children: []
}

export const initialAnnotation: AnnotationState = {
    id: 0,
    name: "name",
    parent_id: null,
    component_type: "unset",
    bounding_box: initialBoundingBox,
    color: "#FF0000",
    isSelected: false,
    hidden: false,
    attributes: {},
    children: []
}

export interface DatasetItemState {
  path: string
  isFolder: boolean
}

export interface GrowthState { 
    x: number, 
    y: number 
}

export interface Selection {
    annotationId: string;
}