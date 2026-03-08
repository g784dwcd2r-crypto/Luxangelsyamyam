import React from 'react';
import { SvgIcon } from '@material-ui/core';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createTheme();

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <div>
                <h1>Lux Angels Cleaning</h1>
                <p>Loading...</p>
                <SvgIcon>
                    {/* Add SVG content here */}
                </SvgIcon>
            </div>
        </ThemeProvider>
    );
};

export default App;