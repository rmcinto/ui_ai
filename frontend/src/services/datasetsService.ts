/**
 * datasetsService.ts
 * Service for interacting with the /datasets routes in the backend.
 */

import api from './api'
import type { AnnotationData, DatasetItemState, MetadataState } from '../types'

export async function listDatasets(path: string): Promise<DatasetItemState[]> {
    // GET /frames/list with optional query parameter
    const response = await api.get<string[] | string>('/datasets/list', {
        params: { path }
    });

    return (response.data as string[]).map((item: string) => ({
        path: item,
        isFolder: !item.toLowerCase().match(/\.(png|jpg|jpeg|gif|bmp|txt|json)$/) // Extend for more file types
    }));
}

export async function getImageFile(path?: string): Promise<Blob> {
    // GET /frames/list with optional query parameter
    const response = await api.get<string[] | string>('/datasets/file', {
        params: { path },
        responseType: 'blob'
    });

    // Otherwise, it's the content of a file
    return response.data as unknown as Blob; // This will be a string (file content)
}

export async function getMetadataFile(path?: string): Promise<MetadataState> {
    // GET /frames/list with optional query parameter
    const response = await api.get<MetadataState>('/datasets/file', {
        params: { path }
    });

    // Otherwise, it's the content of a file
    return response.data; // This will be a string (file content)
}

export async function getAnnotations(path: string): Promise<AnnotationData> {
    // GET /datasets/annotations?path=...
    const response = await api.get('/datasets/annotations', { params: { path } })
    return response.data
}

export async function updateAnnotations(path: string, annotations: AnnotationData) {
    // POST /datasets/annotations?path=...
    const response = await api.post('/datasets/annotations', annotations, { params: { path } })
    return response.data
}
