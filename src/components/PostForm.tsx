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
    Tooltip,
    InputAdornment,
    Collapse,
    Link,
    Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ImageUpload from './ImageUpload';
import { PostContent, SocialMediaAccount, FormattedPost } from '../types';
import { formatContent } from '../utils/formatUtils';
import { geminiService } from '../services/geminiService';
import { generateProfileUrl, extractUsername } from '../utils/linkUtils';

interface PostFormProps {
    selectedModel: string;
}

const LLM_MODELS = {
    'Claude': 'https://claude.ai',
    'ChatGPT': 'https://chat.openai.com',
    'Perplexity': 'https://www.perplexity.ai',
    'Perplexity Labs': 'https://labs.perplexity.ai',
    'Gemini': 'https://gemini.google.com',
    'Grok': 'https://grok.x.ai',
    'Mistral': 'https://mistral.ai',
    'Llama': 'https://llama.meta.com',
};

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
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [isFormatting, setIsFormatting] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showAISuggestions, setShowAISuggestions] = useState(false);

    const handleImageSelect = async (file: File) => {
        setContent(prev => ({ ...prev, image: file }));

        if (!showAISuggestions) {
            setShowAISuggestions(true);
        }

        // Analyze image with Gemini AI
        setIsGenerating(true);
        setAiError('');
        try {
            const response = await geminiService.analyzeImage(file, selectedModel, {
                caption: content.caption,
                referencePost: content.referencePost,
                socialHandles: content.accounts
            });

            if (response.error) {
                setAiError(response.error);
            } else {
                setAiSuggestion(response.text);
                setAiPrompt(response.prompt || '');
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

    const updateAccount = (index: number, value: string) => {
        const username = extractUsername(value);
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

        if (!showAISuggestions) {
            setShowAISuggestions(true);
        }

        setIsGenerating(true);
        setAiError('');
        try {
            const response = await geminiService.generatePost(
                content.caption,
                platform,
                selectedModel,
                {
                    caption: content.caption,
                    referencePost: content.referencePost,
                    socialHandles: content.accounts
                }
            );

            if (response.error) {
                setAiError(response.error);
            } else {
                setContent(prev => ({ ...prev, caption: response.text }));
                setAiPrompt(response.prompt || '');
            }
        } catch (error) {
            setAiError('Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyPromptToClipboard = () => {
        if (aiPrompt) {
            navigator.clipboard.writeText(aiPrompt);
        }
    };

    const copyPostToClipboard = (post: FormattedPost) => {
        navigator.clipboard.writeText(post.content);
    };

    return (
        <Box sx={{
            maxWidth: 800,
            mx: 'auto',
            p: { xs: 2, sm: 3, md: 4 },
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#1a1b1e',
            minHeight: '100vh'
        }}>
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    color: '#d1d0c5',
                    fontWeight: 600,
                    mb: 4,
                    textAlign: 'center',
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
                }}
            >
                Social Media Post Formatter
            </Typography>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                '& > *': {
                    transition: 'all 0.2s ease-in-out'
                }
            }}>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        startIcon={showImageUpload ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{
                            color: '#d1d0c5',
                            borderColor: '#646669',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            '&:hover': {
                                borderColor: '#e2b714',
                                color: '#e2b714',
                                backgroundColor: 'rgba(226, 183, 20, 0.08)',
                            },
                        }}
                    >
                        {showImageUpload ? 'Hide Image Upload' : 'Add Image'}
                    </Button>
                    <Collapse in={showImageUpload}>
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: '#2c2e31',
                            border: '1px solid #646669'
                        }}>
                            <ImageUpload onImageSelect={handleImageSelect} />
                        </Box>
                    </Collapse>
                </Box>

                {isGenerating && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'rgba(226, 183, 20, 0.08)',
                        border: '1px solid #e2b714'
                    }}>
                        <CircularProgress size={24} sx={{ color: '#e2b714' }} />
                        <Typography sx={{ color: '#d1d0c5' }}>Analyzing image...</Typography>
                    </Box>
                )}

                <Collapse in={showAISuggestions}>
                    <Box>
                        {aiSuggestion && (
                            <Paper sx={{
                                mb: 3,
                                p: 3,
                                backgroundColor: '#2c2e31',
                                borderRadius: 2,
                                border: '1px solid #646669',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#e2b714',
                                        mb: 2,
                                        fontWeight: 600
                                    }}
                                >
                                    AI Suggestions
                                </Typography>
                                <Typography sx={{
                                    color: '#d1d0c5',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.6
                                }}>
                                    {aiSuggestion}
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Collapse>

                {aiError && (
                    <Alert
                        severity="error"
                        sx={{
                            backgroundColor: 'rgba(202, 71, 84, 0.1)',
                            color: '#ca4754',
                            borderRadius: 2,
                            border: '1px solid #ca4754',
                            '& .MuiAlert-icon': {
                                color: '#ca4754'
                            }
                        }}
                    >
                        {aiError}
                    </Alert>
                )}

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: '#2c2e31',
                    border: '1px solid #646669'
                }}>
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
                                    borderColor: '#646669',
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

                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Reference Post (Optional)"
                        value={content.referencePost}
                        onChange={handleReferencePostChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: '#d1d0c5',
                                '& fieldset': {
                                    borderColor: '#646669',
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

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            onClick={() => addAccount('twitter')}
                            sx={{
                                color: '#d1d0c5',
                                borderColor: '#646669',
                                '&:hover': {
                                    borderColor: '#e2b714',
                                    color: '#e2b714',
                                    backgroundColor: 'rgba(226, 183, 20, 0.08)',
                                },
                            }}
                        >
                            Add Twitter
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => addAccount('linkedin')}
                            sx={{
                                color: '#d1d0c5',
                                borderColor: '#646669',
                                '&:hover': {
                                    borderColor: '#e2b714',
                                    color: '#e2b714',
                                    backgroundColor: 'rgba(226, 183, 20, 0.08)',
                                },
                            }}
                        >
                            Add LinkedIn
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => addAccount('instagram')}
                            sx={{
                                color: '#d1d0c5',
                                borderColor: '#646669',
                                '&:hover': {
                                    borderColor: '#e2b714',
                                    color: '#e2b714',
                                    backgroundColor: 'rgba(226, 183, 20, 0.08)',
                                },
                            }}
                        >
                            Add Instagram
                        </Button>
                    </Box>

                    {content.accounts.map((account, index) => (
                        <Paper
                            key={index}
                            sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                backgroundColor: '#323437',
                                borderRadius: 2,
                                border: '1px solid #646669'
                            }}
                        >
                            <Typography sx={{ color: '#d1d0c5', minWidth: 100 }}>
                                {account.platform}:
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder={`Enter ${account.platform} username or URL`}
                                value={account.username}
                                onChange={(e) => updateAccount(index, e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LinkIcon sx={{ color: '#646669' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: '#d1d0c5',
                                        '& fieldset': {
                                            borderColor: '#646669',
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
                            <IconButton
                                onClick={() => removeAccount(index)}
                                sx={{
                                    color: '#d1d0c5',
                                    '&:hover': {
                                        color: '#ca4754',
                                        backgroundColor: 'rgba(202, 71, 84, 0.08)'
                                    }
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                            <Tooltip title="Generate AI-optimized content for this platform">
                                <IconButton
                                    onClick={() => handleAIGenerate(account.platform)}
                                    disabled={isGenerating || isFormatting}
                                    sx={{
                                        color: '#d1d0c5',
                                        '&:hover': {
                                            color: '#e2b714',
                                            backgroundColor: 'rgba(226, 183, 20, 0.08)'
                                        }
                                    }}
                                >
                                    <AutoFixHighIcon />
                                </IconButton>
                            </Tooltip>
                        </Paper>
                    ))}

                    <Button
                        variant="contained"
                        onClick={handleFormat}
                        fullWidth
                        disabled={isGenerating || isFormatting}
                        sx={{
                            backgroundColor: '#e2b714',
                            color: '#323437',
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: '#d1d0c5',
                            },
                            '&:disabled': {
                                backgroundColor: '#646669',
                                color: '#323437'
                            }
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

                {formattedPosts.length > 0 && (
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#d1d0c5',
                                mb: 3,
                                fontWeight: 600
                            }}
                        >
                            Formatted Posts
                        </Typography>
                        {formattedPosts.map((post, index) => (
                            <Card
                                key={index}
                                sx={{
                                    mb: 3,
                                    backgroundColor: '#2c2e31',
                                    borderRadius: 2,
                                    border: '1px solid #646669',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <CardContent>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                color: '#e2b714',
                                                fontWeight: 600
                                            }}
                                        >
                                            {post.platform} (@{post.username})
                                        </Typography>
                                        <Tooltip title="Copy post">
                                            <IconButton
                                                onClick={() => copyPostToClipboard(post)}
                                                sx={{
                                                    color: '#d1d0c5',
                                                    '&:hover': {
                                                        color: '#e2b714',
                                                        backgroundColor: 'rgba(226, 183, 20, 0.08)'
                                                    }
                                                }}
                                            >
                                                <ContentCopyIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Typography
                                        sx={{
                                            color: '#d1d0c5',
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {post.content}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                {aiPrompt && (
                    <Paper sx={{
                        mb: 2,
                        p: 3,
                        backgroundColor: '#2c2e31',
                        borderRadius: 2,
                        border: '1px solid #646669',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#e2b714',
                                    fontWeight: 600
                                }}
                            >
                                Generated Prompt
                            </Typography>
                            <Tooltip title="Copy prompt">
                                <IconButton
                                    onClick={copyPromptToClipboard}
                                    sx={{
                                        color: '#d1d0c5',
                                        '&:hover': {
                                            color: '#e2b714',
                                            backgroundColor: 'rgba(226, 183, 20, 0.08)'
                                        }
                                    }}
                                >
                                    <ContentCopyIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography sx={{
                            color: '#d1d0c5',
                            whiteSpace: 'pre-wrap',
                            mb: 3,
                            lineHeight: 1.6,
                            p: 2,
                            backgroundColor: '#323437',
                            borderRadius: 1,
                            border: '1px solid #646669'
                        }}>
                            {aiPrompt}
                        </Typography>
                        <Divider sx={{ borderColor: '#646669', my: 3 }} />
                        <Typography
                            variant="subtitle2"
                            sx={{
                                color: '#646669',
                                mb: 2,
                                fontWeight: 600
                            }}
                        >
                            Try this prompt with other AI models:
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1.5
                        }}>
                            {Object.entries(LLM_MODELS).map(([name, url]) => (
                                <Button
                                    key={name}
                                    variant="outlined"
                                    size="small"
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    endIcon={<OpenInNewIcon />}
                                    sx={{
                                        color: '#d1d0c5',
                                        borderColor: '#646669',
                                        borderRadius: 2,
                                        px: 2,
                                        '&:hover': {
                                            borderColor: '#e2b714',
                                            color: '#e2b714',
                                            backgroundColor: 'rgba(226, 183, 20, 0.08)',
                                        },
                                    }}
                                >
                                    {name}
                                </Button>
                            ))}
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default PostForm; 