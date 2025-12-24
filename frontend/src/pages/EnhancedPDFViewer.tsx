import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faArrowLeft, faDownload } from '@fortawesome/free-solid-svg-icons';

export const EnhancedPDFViewer: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);

    // Download stats
    const [progress, setProgress] = useState(0);
    const [downloadedSize, setDownloadedSize] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [speed, setSpeed] = useState(0); // bytes per second
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // seconds
    const [downloadStarted, setDownloadStarted] = useState(false);

    const pdfUrl = searchParams.get('url');
    const pdfTitle = searchParams.get('title') || 'PDF Document';
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!pdfUrl) {
            setError('No PDF URL provided');
            setIsLoading(false);
            return;
        }

        // Set document title
        document.title = pdfTitle;

        const loadPdf = async () => {
            try {
                setIsLoading(true);
                setDownloadStarted(false);
                setError(null);
                setProgress(0);

                // Create abort controller for cleanup
                const controller = new AbortController();
                abortControllerRef.current = controller;

                // Use backend proxy to avoid CORS issues
                const proxyUrl = `/api/course-content/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`;

                const response = await fetch(proxyUrl, {
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
                }

                const contentLength = response.headers.get('content-length');
                const total = contentLength ? parseInt(contentLength, 10) : 0;
                setTotalSize(total);

                const reader = response.body?.getReader();
                if (!reader) throw new Error('ReadableStream not supported');

                const chunks: Uint8Array[] = [];
                let received = 0;
                let lastUpdate = Date.now();
                let lastReceived = 0;
                const startTime = Date.now();

                // Speed calculation buffer
                const speedReadings: number[] = [];
                const MAX_SPEED_READINGS = 5;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    if (!downloadStarted && value.length > 0) {
                        setDownloadStarted(true);
                    }

                    chunks.push(value);
                    received += value.length;

                    // Update stats every ~200ms to avoid too many re-renders
                    const now = Date.now();
                    if (now - lastUpdate > 200 || received === total) {
                        const timeDiff = (now - lastUpdate) / 1000; // seconds
                        const bytesDiff = received - lastReceived;
                        const currentSpeed = bytesDiff / timeDiff; // bytes/sec

                        // Moving average for smoother speed display
                        speedReadings.push(currentSpeed);
                        if (speedReadings.length > MAX_SPEED_READINGS) speedReadings.shift();
                        const avgSpeed = speedReadings.reduce((a, b) => a + b, 0) / speedReadings.length;

                        setSpeed(avgSpeed);
                        setDownloadedSize(received);

                        if (total > 0) {
                            setProgress((received / total) * 100);
                            const remainingBytes = total - received;
                            if (avgSpeed > 0) {
                                setTimeRemaining(remainingBytes / avgSpeed);
                            }
                        }

                        lastUpdate = now;
                        lastReceived = received;
                    }
                }

                // Create Blob URL
                const blob = new Blob(chunks as BlobPart[], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                const finalViewerUrl = `/pdfjs/viewer.html?file=${encodeURIComponent(blobUrl)}`;

                setViewerUrl(finalViewerUrl);
                setIsLoading(false);

            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    console.log('Download aborted');
                    return;
                }
                console.error('Error loading PDF:', err);
                setError(err instanceof Error ? err.message : 'Failed to load PDF');
                setIsLoading(false);
            }
        };

        loadPdf();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (viewerUrl) {
                // Clean up blob URL? We can't easily access the blob URL string here to revoke it
                // unless we store it in a ref or state. But since we're unmounting,
                // the browser will eventually handle it, but explicit revoke is better.
                // For now, we'll rely on page navigation cleanup.
            }
        };
    }, [pdfUrl, pdfTitle]);

    // Format helpers
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatTime = (seconds: number | null) => {
        if (seconds === null || !isFinite(seconds)) return '--';
        if (seconds < 1) return '< 1s';
        if (seconds < 60) return `${Math.ceil(seconds)}s`;
        const mins = Math.floor(seconds / 60);
        const secs = Math.ceil(seconds % 60);
        return `${mins}m ${secs}s`;
    };

    if (error) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg shadow-xl mx-4">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">PDF Load Error</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-900 flex flex-col relative overflow-hidden">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-50 px-4">
                    <div className="w-full max-w-md space-y-6">
                        {/* Icon & Title */}
                        <div className="text-center">
                            <div className="inline-block p-4 bg-gray-800 rounded-full mb-4 relative">
                                {downloadStarted ? (
                                    <>
                                        <FontAwesomeIcon icon={faDownload} className="text-3xl text-blue-400" />
                                        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-pulse"></div>
                                    </>
                                ) : (
                                    <FontAwesomeIcon icon={faSpinner} className="text-3xl text-blue-400 animate-spin" />
                                )}
                            </div>
                            <h2 className="text-xl font-medium text-white mb-1">
                                {downloadStarted ? 'Downloading PDF' : 'Initiating Download...'}
                            </h2>
                            <p className="text-sm text-gray-400 truncate px-4">{pdfTitle}</p>
                        </div>

                        {/* Progress Circle/Bar - Only show when started */}
                        <div className={`space-y-2 transition-opacity duration-300 ${downloadStarted ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="flex justify-between text-sm font-medium text-blue-400">
                                <span>{Math.round(progress)}%</span>
                                <span>{formatSize(downloadedSize)} / {totalSize > 0 ? formatSize(totalSize) : '--'}</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-200 ease-out rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Grid - Only show when started */}
                        <div className={`grid grid-cols-2 gap-4 pt-2 transition-opacity duration-300 ${downloadStarted ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="bg-gray-800/50 p-3 rounded-lg text-center backdrop-blur-sm">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Speed</p>
                                <p className="text-white font-medium font-mono">{formatSize(speed)}/s</p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg text-center backdrop-blur-sm">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time Left</p>
                                <p className="text-white font-medium font-mono">{formatTime(timeRemaining)}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="w-full mt-8 py-3 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* PDF Viewer Iframe */}
            {viewerUrl && !isLoading && (
                <iframe
                    src={viewerUrl}
                    title={pdfTitle}
                    className="w-full h-full border-0"
                    allow="fullscreen"
                />
            )}
        </div>
    );
};
