'use client'; // Ensures client-side execution (App Router requirement)

import { useCallback } from 'react';
import JSZip from 'jszip';

interface ExportData {
    jsonData: any; // Replace with your SensorRecord type from types.d.ts
    filename: string;
}

export const useJsonZipExport = () => {
    const compressAndDownload = useCallback(async ({ jsonData, filename }: ExportData) => {
        // Step 1: Data validation
        if (!jsonData) {
            throw new Error('No data provided for export')
        }

        if (typeof jsonData !== 'object' || jsonData === null) {
            throw new Error('Export data must be a valid object')
        }

        const jsonString = JSON.stringify(jsonData, null, 2)

        // Step 2: Size validation (optional - prevent browser memory issues)
        if (jsonString.length > 100 * 1024 * 1024) { // 100MB limit
            throw new Error('Data too large for browser export. Consider smaller time range.')
        }

        const zip = new JSZip()
        zip.file(`${filename}.json`, jsonString)

        try {
            console.log(`Compressing ${jsonString.length} chars to ZIP...`) // Dev logging
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE', // Enable compression (default is STORE)
                compressionOptions: { level: 6 } // Balance speed vs compression ratio
            })

            console.log(`ZIP created: ${zipBlob.size} bytes (original: ~${jsonString.length} bytes)`) // Dev logging

            // Step 3: Create download
            const url = URL.createObjectURL(zipBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${filename}.zip`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Step 4: Memory cleanup with delay (browser needs time to start download)
            setTimeout(() => {
                URL.revokeObjectURL(url)
            }, 2000)

            return { success: true, zipSize: zipBlob.size, originalSize: jsonString.length }

        } catch (error) {
            console.error('ZIP compression failed:', error)

            // Enhanced fallback with user-friendly error
            if (error instanceof Error && error.message.includes('too large')) {
                throw new Error('Data exceeds browser limits. Try a smaller time range.')
            }

            // Fallback to raw JSON
            const fallbackBlob = new Blob([jsonString], { type: 'application/json' })
            const fallbackUrl = URL.createObjectURL(fallbackBlob)
            const fallbackLink = document.createElement('a')
            fallbackLink.href = fallbackUrl
            fallbackLink.download = `${filename}_fallback.json`
            document.body.appendChild(fallbackLink)
            fallbackLink.click()
            document.body.removeChild(fallbackLink)
            URL.revokeObjectURL(fallbackUrl)

            if (!('Blob' in window) || !('URL' in window)) {
                // Last resort: open new window with JSON text
                const jsonWindow = (window as any).open('', '_blank')
                if (jsonWindow) {
                    jsonWindow.document.write(`<pre>${jsonString}</pre>`)
                    jsonWindow.document.title = `${filename}_raw.json`
                }
                throw new Error('Browser does not support modern download APIs')
            }


            throw error // Re-throw for component to handle
        }
    }, [])


    return { compressAndDownload };
};
