import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    IconButton,
    Card,
    CardContent,
    CircularProgress,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ImageUpload from './ImageUpload';
import { PostContent, SocialMediaAccount, FormattedPost } from '../types';
import { formatContent } from '../utils/formatUtils';
import { geminiService } from '../services/geminiService';

interface PostFormProps {
    selectedModel: string;
}

const PostForm: React.FC<PostFormProps> = ({ selectedModel }) => {
    const [content, setContent] = useState<PostContent>({
        image: null,
        caption: '',
        accounts: [],
        referencePost: '',
    });

    const [formattedPosts, setFormattedPosts] = useState<FormattedPost[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState<string>('');
    const [aiSuggestion, setAiSuggestion] = useState<string>('');
    const [isFormatting, setIsFormatting] = useState(false);

    const handleImageSelect = async (file: File) => {
        setContent(prev => ({ ...prev, image: file }));

        // Analyze image with Gemini AI
        setIsGenerating(true);
        setAiError('');
        try {
            const response = await geminiService.analyzeImage(file, selectedModel);
            if (response.error) {
                setAiError(response.error);
            } else {
                setAiSuggestion(response.text);
            }
        } catch (error) {
            setAiError('Failed to analyze image');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCaptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setContent(prev => ({ ...prev, caption: event.target.value }));
    };

    const handleReferencePostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setContent(prev => ({ ...prev, referencePost: event.target.value }));
    };

    const addAccount = (platform: 'twitter' | 'linkedin' | 'instagram') => {
        setContent(prev => ({
            ...prev,
            accounts: [...prev.accounts, { platform, username: '' }],
        }));
    };

    const updateAccount = (index: number, username: string) => {
        setContent(prev => ({
            ...prev,
            accounts: prev.accounts.map((acc, i) =>
                i === index ? { ...acc, username } : acc
            ),
        }));
    };

    const removeAccount = (index: number) => {
        setContent(prev => ({
            ...prev,
            accounts: prev.accounts.filter((_, i) => i !== index),
        }));
    };

    const handleFormat = async () => {
        if (content.accounts.length === 0) {
            setAiError('Please add at least one social media account');
            return;
        }

        if (!content.caption) {
            setAiError('Please enter a caption');
            return;
        }

        setIsFormatting(true);
        setAiError('');
        try {
            const formatted = await formatContent(content);
            setFormattedPosts(formatted);
        } catch (error) {
            setAiError('Failed to format posts');
        } finally {
            setIsFormatting(false);
        }
    };

    const handleAIGenerate = async (platform: 'twitter' | 'linkedin' | 'instagram') => {
        if (!content.caption) {
            setAiError('Please enter some content first');
            return;
        }

        setIsGenerating(true);
        setAiError('');
        try {
            const response = await geminiService.generatePost(content.caption, platform, selectedModel);
            if (response.error) {
                setAiError(response.error);
            } else {
                setContent(prev => ({ ...prev, caption: response.text }));
            }
        } catch (error) {
            setAiError('Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, fontFamily: 'monospace' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#d1d0c5' }}>
                Social Media Post Formatter
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                    <ImageUpload onImageSelect={handleImageSelect} />
                    {isGenerating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                            <CircularProgress size={20} sx={{ color: '#e2b714' }} />
                            <Typography sx={{ color: '#d1d0c5' }}>Analyzing image...</Typography>
                        </Box>
                    )}
                    {aiSuggestion && (
                        <Paper sx={{ mt: 2, p: 2, backgroundColor: '#2c2e31' }}>
                            <Typography variant="h6" sx={{ color: '#e2b714', mb: 1 }}>
                                AI Suggestions
                            </Typography>
                            <Typography sx={{ color: '#d1d0c5', whiteSpace: 'pre-wrap' }}>
                                {aiSuggestion}
                            </Typography>
                        </Paper>
                    )}
                    {aiError && (
                        <Alert severity="error" sx={{ mt: 2, backgroundColor: '#323437', color: '#ca4754' }}>
                            {aiError}
                        </Alert>
                    )}
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Caption"
                        value={content.caption}
                        onChange={handleCaptionChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: '#d1d0c5',
                                '& fieldset': {
                                    borderColor: '#323437',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#e2b714',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#e2b714',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#646669',
                            },
                        }}
                    />
                </Box>

                <Box>
                    <TextField
                        fullWidth
                        label="Reference Post (Optional)"
                        value={content.referencePost}
                        onChange={handleReferencePostChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: '#d1d0c5',
                                '& fieldset': {
                                    borderColor: '#323437',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#e2b714',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#e2b714',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#646669',
                            },
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: '#d1d0c5' }}>
                        Social Media Accounts
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            onClick={() => addAccount('twitter')}
                            sx={{ mr: 1, color: '#d1d0c5', '&:hover': { color: '#e2b714' } }}
                        >
                            Add Twitter
                        </Button>
                        <Button
                            onClick={() => addAccount('linkedin')}
                            sx={{ mr: 1, color: '#d1d0c5', '&:hover': { color: '#e2b714' } }}
                        >
                            Add LinkedIn
                        </Button>
                        <Button
                            onClick={() => addAccount('instagram')}
                            sx={{ color: '#d1d0c5', '&:hover': { color: '#e2b714' } }}
                        >
                            Add Instagram
                        </Button>
                    </Box>

                    {content.accounts.map((account, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: '#323437' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <TextField
                                        fullWidth
                                        label={`${account.platform} Username`}
                                        value={account.username}
                                        onChange={(e) => updateAccount(index, e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: '#d1d0c5',
                                                '& fieldset': {
                                                    borderColor: '#323437',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#e2b714',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#e2b714',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: '#646669',
                                            },
                                        }}
                                    />
                                </Box>
                                <IconButton
                                    onClick={() => removeAccount(index)}
                                    sx={{ color: '#d1d0c5', '&:hover': { color: '#ca4754' } }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleAIGenerate(account.platform)}
                                    disabled={isGenerating || isFormatting}
                                    sx={{ color: '#d1d0c5', '&:hover': { color: '#e2b714' } }}
                                >
                                    <AutoFixHighIcon />
                                </IconButton>
                            </Box>
                        </Paper>
                    ))}
                </Box>

                <Box>
                    <Button
                        variant="contained"
                        onClick={handleFormat}
                        fullWidth
                        disabled={isGenerating || isFormatting}
                        sx={{
                            backgroundColor: '#e2b714',
                            color: '#323437',
                            '&:hover': {
                                backgroundColor: '#d1d0c5',
                            },
                        }}
                    >
                        {isFormatting ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} sx={{ color: '#323437' }} />
                                <Typography>Formatting posts...</Typography>
                            </Box>
                        ) : (
                            'Format Posts'
                        )}
                    </Button>
                </Box>

                {formattedPosts.map((post, index) => (
                    <Box key={index}>
                        <Card sx={{ backgroundColor: '#323437' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ color: '#e2b714' }}>
                                    {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                                </Typography>
                                <Typography
                                    component="pre"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        backgroundColor: '#2c2e31',
                                        p: 2,
                                        borderRadius: 1,
                                        color: '#d1d0c5',
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    {post.content}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default PostForm; 