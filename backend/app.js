const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// Middleware
app.use(bodyParser.json());

// Auth routes
app.post('/api/auth/pin-login', (req, res) => {
    // Implementation for owner/cleaner login
});

// Employee routes
app.post('/api/employees', (req, res) => {
    // Implementation for creating employee accounts (owner only)
});

app.put('/api/employees/:id/pin', (req, res) => {
    // Implementation for setting/reseting PIN (owner only or employee with oldPin)
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
