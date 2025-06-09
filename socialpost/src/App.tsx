import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import PostForm from './components/PostForm';

// Available Gemini models
export const GEMINI_MODELS = {
  'gemini-1.0-pro': 'Gemini 1.0 Pro',
  'gemini-1.0-pro-vision': 'Gemini 1.0 Pro Vision',
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
  'gemini-1.5-pro': 'Gemini 1.5 Pro',
  'gemini-1.5-pro-vision': 'Gemini 1.5 Pro Vision'
};

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [theme, setTheme] = useState(createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      background: {
        default: prefersDarkMode ? '#1a1b1e' : '#f5f5f5',
        paper: prefersDarkMode ? '#2c2e31' : '#ffffff',
      },
      primary: {
        main: '#e2b714',
      },
      text: {
        primary: prefersDarkMode ? '#d1d0c5' : '#323437',
        secondary: prefersDarkMode ? '#646669' : '#666666',
      },
    },
    typography: {
      fontFamily: 'monospace',
      h4: {
        fontWeight: 600,
        color: prefersDarkMode ? '#d1d0c5' : '#323437',
      },
      body1: {
        color: prefersDarkMode ? '#d1d0c5' : '#323437',
      },
      body2: {
        color: prefersDarkMode ? '#646669' : '#666666',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: prefersDarkMode ? '#1a1b1e' : '#f5f5f5',
            minHeight: '100vh',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: prefersDarkMode ? '#2c2e31' : '#ffffff',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: prefersDarkMode ? '#2c2e31' : '#ffffff',
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: prefersDarkMode ? '#323437' : '#ffffff',
              transition: 'background-color 0.3s ease',
              '& fieldset': {
                borderColor: prefersDarkMode ? '#646669' : '#cccccc',
              },
              '&:hover fieldset': {
                borderColor: '#e2b714',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#e2b714',
              },
            },
            '& .MuiInputLabel-root': {
              color: prefersDarkMode ? '#646669' : '#666666',
            },
            '& .MuiInputBase-input': {
              color: prefersDarkMode ? '#d1d0c5' : '#323437',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            color: prefersDarkMode ? '#d1d0c5' : '#323437',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: prefersDarkMode ? '#646669' : '#cccccc',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e2b714',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e2b714',
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: prefersDarkMode ? '#d1d0c5' : '#323437',
            '&:hover': {
              backgroundColor: prefersDarkMode ? '#323437' : '#f5f5f5',
            },
            '&.Mui-selected': {
              backgroundColor: prefersDarkMode ? '#323437' : '#f5f5f5',
              '&:hover': {
                backgroundColor: prefersDarkMode ? '#323437' : '#f5f5f5',
              },
            },
          },
        },
      },
    },
  }));

  useEffect(() => {
    setTheme(prevTheme => createTheme({
      ...prevTheme,
      palette: {
        ...prevTheme.palette,
        mode: prefersDarkMode ? 'dark' : 'light',
        background: {
          default: prefersDarkMode ? '#1a1b1e' : '#f5f5f5',
          paper: prefersDarkMode ? '#2c2e31' : '#ffffff',
        },
        text: {
          primary: prefersDarkMode ? '#d1d0c5' : '#323437',
          secondary: prefersDarkMode ? '#646669' : '#666666',
        },
      },
      typography: {
        ...prevTheme.typography,
        h4: {
          ...prevTheme.typography.h4,
          color: prefersDarkMode ? '#d1d0c5' : '#323437',
        },
        body1: {
          ...prevTheme.typography.body1,
          color: prefersDarkMode ? '#d1d0c5' : '#323437',
        },
        body2: {
          ...prevTheme.typography.body2,
          color: prefersDarkMode ? '#646669' : '#666666',
        },
      },
      components: {
        ...prevTheme.components,
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: prefersDarkMode ? '#1a1b1e' : '#f5f5f5',
              minHeight: '100vh',
              transition: 'background-color 0.3s ease',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: prefersDarkMode ? '#2c2e31' : '#ffffff',
              transition: 'background-color 0.3s ease',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: prefersDarkMode ? '#2c2e31' : '#ffffff',
              transition: 'background-color 0.3s ease',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                backgroundColor: prefersDarkMode ? '#323437' : '#ffffff',
                transition: 'background-color 0.3s ease',
                '& fieldset': {
                  borderColor: prefersDarkMode ? '#646669' : '#cccccc',
                },
                '&:hover fieldset': {
                  borderColor: '#e2b714',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#e2b714',
                },
              },
              '& .MuiInputLabel-root': {
                color: prefersDarkMode ? '#646669' : '#666666',
              },
              '& .MuiInputBase-input': {
                color: prefersDarkMode ? '#d1d0c5' : '#323437',
              },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              color: prefersDarkMode ? '#d1d0c5' : '#323437',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: prefersDarkMode ? '#646669' : '#cccccc',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2b714',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2b714',
              },
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              color: prefersDarkMode ? '#d1d0c5' : '#323437',
              '&:hover': {
                backgroundColor: prefersDarkMode ? '#323437' : '#f5f5f5',
              },
              '&.Mui-selected': {
                backgroundColor: prefersDarkMode ? '#323437' : '#f5f5f5',
                '&:hover': {
                  backgroundColor: prefersDarkMode ? '#323437' : '#f5f5f5',
                },
              },
            },
          },
        },
      },
    }));
  }, [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="model-select-label">AI Model</InputLabel>
            <Select
              labelId="model-select-label"
              value={selectedModel}
              label="AI Model"
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {Object.entries(GEMINI_MODELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <PostForm selectedModel={selectedModel} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
