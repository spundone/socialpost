import React, { useCallback, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, IconButton } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { compressImage } from '../utils/imageUtils';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface ImageUploadProps {
    onImageSelect: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
    const [error, setError] = useState<string>('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploadStatus('uploading');
        setError('');

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            setUploadStatus('error');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            setUploadStatus('error');
            return;
        }

        try {
            // Create preview URL
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);

            // Compress image if it's larger than 1MB
            const processedFile = file.size > 1024 * 1024
                ? await compressImage(file)
                : file;

            setSelectedFile(processedFile);
            onImageSelect(processedFile);
            setUploadStatus('success');
            setError('');
        } catch (err) {
            setError('Error processing image');
            setUploadStatus('error');
            setPreviewUrl(null);
        }
    }, [onImageSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxFiles: 1
    });

    const handleRemoveImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setSelectedFile(null);
        setUploadStatus('idle');
        setError('');
        onImageSelect(null as any);
    };

    return (
        <Box sx={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'monospace'
        }}>
            {!previewUrl ? (
                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed #323437',
                        borderRadius: '4px',
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? '#2c2e31' : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: '#2c2e31',
                            borderColor: '#e2b714'
                        }
                    }}
                >
                    <input {...getInputProps()} />
                    <Typography sx={{
                        color: '#d1d0c5',
                        fontSize: '1.1rem',
                        mb: 1
                    }}>
                        {isDragActive
                            ? 'Drop the image here'
                            : 'Drag and drop an image here, or click to select'}
                    </Typography>
                    <Typography sx={{
                        color: '#646669',
                        fontSize: '0.9rem'
                    }}>
                        Supports JPG, JPEG, PNG, GIF (max 5MB)
                    </Typography>
                </Box>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        backgroundColor: '#323437',
                        borderRadius: '4px',
                        position: 'relative'
                    }}
                >
                    <Box sx={{ position: 'relative', width: '100%' }}>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '4px',
                                maxHeight: '400px',
                                objectFit: 'contain'
                            }}
                        />
                        <IconButton
                            onClick={handleRemoveImage}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(50, 52, 55, 0.8)',
                                color: '#d1d0c5',
                                '&:hover': {
                                    backgroundColor: 'rgba(50, 52, 55, 0.9)',
                                    color: '#e2b714'
                                }
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{
                        mt: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#d1d0c5'
                    }}>
                        {uploadStatus === 'uploading' && (
                            <>
                                <CircularProgress size={20} sx={{ color: '#e2b714' }} />
                                <Typography>Processing image...</Typography>
                            </>
                        )}
                        {uploadStatus === 'success' && (
                            <>
                                <CheckCircleIcon sx={{ color: '#e2b714' }} />
                                <Typography>Image uploaded successfully</Typography>
                            </>
                        )}
                        {uploadStatus === 'error' && (
                            <>
                                <ErrorIcon sx={{ color: '#ca4754' }} />
                                <Typography sx={{ color: '#ca4754' }}>
                                    {error || 'Error uploading image'}
                                </Typography>
                            </>
                        )}
                    </Box>

                    {selectedFile && (
                        <Typography sx={{
                            mt: 1,
                            color: '#646669',
                            fontSize: '0.9rem'
                        }}>
                            File size: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                        </Typography>
                    )}
                </Paper>
            )}

            {error && !previewUrl && (
                <Typography sx={{
                    mt: 1,
                    color: '#ca4754',
                    fontSize: '0.9rem'
                }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default ImageUpload; 