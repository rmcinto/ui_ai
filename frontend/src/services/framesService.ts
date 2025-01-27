/**
 * framesService.ts
 * Service for interacting with the /frames routes in the backend.
 */

import api from './api'
import type { FrameOrFolderState } from '../types'

/**
 * Fetches the list of frames (folders and files) or the content of a file.
 * 
 * @param path - Optional path to a folder or file
 * @returns - If the path is a directory, returns a list of FrameOrFolder items.
 *            If the path is a file, returns the file content as a string.
 */
export async function listFrameContents(path?: string): Promise<FrameOrFolderState[]> {
    // GET /frames/list with optional query parameter
    const response = await api.get<string[] | string>('/frames/list', {
        params: { path }
    });

    return (response.data as string[]).map((item: string) => ({
        path: item,
        isFolder: !item.toLowerCase().match(/\.(png|jpg|jpeg|gif|bmp|txt|json)$/) // Extend for more file types
    }));
}

export async function getImageFile(path?: string): Promise<Blob> {
    // GET /frames/list with optional query parameter
    const response = await api.get<string[] | string>('/frames/file', {
        params: { path },
        responseType: 'blob'
    });

    // Otherwise, it's the content of a file
    return response.data as unknown as Blob; // This will be a string (file content)
}

export async function convertFrame(path: string) {
    // POST /frames/convert?path=...
    const response = await api.post('/frames/convert', null, { params: { path } })
    return response.data
}
