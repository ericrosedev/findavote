import { useState } from 'react';
import { useActor } from '../hooks/useActor';

const CHUNK_SIZE = 2_000_000;

export const useFileUpload = () => {
    const { actor } = useActor();
    const [isUploading, setIsUploading] = useState(false);

    const sanitizeUrl = (path: string): string => {
        return path
            .trim() // Remove leading/trailing whitespace first
            .replace(/\s+/g, '-') // Replace all whitespace sequences with single hyphen
            .replace(/[^a-zA-Z0-9\-_./]/g, '') // Remove invalid characters
            .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
            .replace(/\.\./g, '') // Remove path traversal attempts
            .replace(/^[-\/]+/, '') // Remove leading hyphens and slashes
            .replace(/\/+/g, '/') // Normalize multiple slashes to single slash
            .replace(/[-\/]+$/, ''); // Remove trailing hyphens and slashes
    };

    const uploadFile = async (
        path: string,
        mimeType: string,
        data: Uint8Array,
        onProgress?: (percentage: number) => void
    ): Promise<void> => {
        if (!actor) {
            throw new Error('Backend is not available');
        }

        setIsUploading(true);

        try {
            const totalChunks = Math.ceil(data.length / CHUNK_SIZE);

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, data.length);
                const chunk = data.slice(start, end);
                const complete = chunkIndex === totalChunks - 1;

                let sanitizedPath = sanitizeUrl(path);
                await actor.upload(sanitizedPath, mimeType, chunk, complete);

                const progress = ((chunkIndex + 1) / totalChunks) * 100;
                onProgress?.(progress);
            }
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadFile, isUploading };
};