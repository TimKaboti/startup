const express = require('express');
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

const port = process.argv.length > 2 ? process.argv[2] : 4000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
