import React from 'react';
import { CssBaseline, Container, ThemeProvider, createTheme } from '@mui/material';
import PostForm from './components/PostForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <PostForm />
      </Container>
    </ThemeProvider>
  );
}

export default App;
