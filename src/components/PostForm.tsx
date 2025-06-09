import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Grid,
    IconButton,
    Card,
    CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageUpload from './ImageUpload';
import { PostContent, SocialMediaAccount, FormattedPost } from '../types';
import { formatContent } from '../utils/formatUtils';

const PostForm: React.FC = () => {
    const [content, setContent] = useState<PostContent>({
        image: null,
        caption: '',
        accounts: [],
        referencePost: '',
    });

    const [formattedPosts, setFormattedPosts] = useState<FormattedPost[]>([]);

    const handleImageSelect = (file: File) => {
        setContent(prev => ({ ...prev, image: file }));
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

    const handleFormat = () => {
        const formatted = formatContent(content);
        setFormattedPosts(formatted);
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Social Media Post Formatter
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <ImageUpload onImageSelect={handleImageSelect} />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Caption"
                        value={content.caption}
                        onChange={handleCaptionChange}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Reference Post (Optional)"
                        value={content.referencePost}
                        onChange={handleReferencePostChange}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Social Media Accounts
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Button onClick={() => addAccount('twitter')} sx={{ mr: 1 }}>
                            Add Twitter
                        </Button>
                        <Button onClick={() => addAccount('linkedin')} sx={{ mr: 1 }}>
                            Add LinkedIn
                        </Button>
                        <Button onClick={() => addAccount('instagram')}>
                            Add Instagram
                        </Button>
                    </Box>

                    {content.accounts.map((account, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 2 }}>
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs>
                                    <TextField
                                        fullWidth
                                        label={`${account.platform} Username`}
                                        value={account.username}
                                        onChange={(e) => updateAccount(index, e.target.value)}
                                    />
                                </Grid>
                                <Grid item>
                                    <IconButton onClick={() => removeAccount(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFormat}
                        fullWidth
                    >
                        Format Posts
                    </Button>
                </Grid>

                {formattedPosts.map((post, index) => (
                    <Grid item xs={12} key={index}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                                </Typography>
                                <Typography
                                    component="pre"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        backgroundColor: '#f5f5f5',
                                        p: 2,
                                        borderRadius: 1,
                                    }}
                                >
                                    {post.content}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PostForm; 