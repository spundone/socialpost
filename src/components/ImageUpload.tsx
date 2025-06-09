import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ImageUploadProps {
    onImageSelect: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onImageSelect(acceptedFiles[0]);
        }
    }, [onImageSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1
    });

    return (
        <Paper
            {...getRootProps()}
            sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? '#f0f0f0' : 'white',
                border: '2px dashed #ccc',
                '&:hover': {
                    backgroundColor: '#f0f0f0'
                }
            }}
        >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the image here' : 'Drag and drop an image here, or click to select'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
                Supports JPG, JPEG, PNG
            </Typography>
        </Paper>
    );
};

export default ImageUpload; 