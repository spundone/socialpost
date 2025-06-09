import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { validateImage, compressImage } from '../utils/imageUtils';

interface ImageUploadProps {
    onImageSelect: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const processImage = async (file: File) => {
        try {
            setIsProcessing(true);
            setError(null);

            // Validate the image
            await validateImage(file);

            // Compress the image
            const compressedFile = await compressImage(file);

            // Create preview URL
            const preview = URL.createObjectURL(compressedFile);
            setPreviewUrl(preview);

            // Pass the processed file to parent
            onImageSelect(compressedFile);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsProcessing(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        try {
            // Compress image if it's larger than 1MB
            const processedFile = file.size > 1024 * 1024
                ? await compressImage(file)
                : file;

            onImageSelect(processedFile);
            setError('');
        } catch (err) {
            setError('Error processing image');
        }
    }, [onImageSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxFiles: 1,
        disabled: isProcessing
    });

    return (
        <Box>
            <Paper
                {...getRootProps()}
                sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: isProcessing ? 'default' : 'pointer',
                    backgroundColor: isDragActive ? '#f0f0f0' : 'white',
                    border: '2px dashed #ccc',
                    '&:hover': {
                        backgroundColor: isProcessing ? 'white' : '#f0f0f0'
                    },
                    position: 'relative',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <input {...getInputProps()} />

                {isProcessing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography>Processing image...</Typography>
                    </Box>
                ) : (
                    <>
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {isDragActive ? 'Drop the image here' : 'Drag and drop an image here, or click to select'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Supports JPG, JPEG, PNG, GIF (max 5MB)
                        </Typography>
                    </>
                )}
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {previewUrl && !error && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default ImageUpload; 