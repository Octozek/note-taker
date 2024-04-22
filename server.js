const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve notes.html
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// Route to get all notes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'public', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes from the database.' });
            return;
        }
        const notes = JSON.parse(data);
        res.json(notes);
    });
});

// Route to save a new note
app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    fs.readFile(path.join(__dirname, 'public', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes from the database.' });
            return;
        }
        const notes = JSON.parse(data);
        newNote.id = generateUniqueId(); // Generate unique ID for the note
        notes.push(newNote);
        fs.writeFile(path.join(__dirname, 'public', 'db', 'db.json'), JSON.stringify(notes), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to save the note to the database.' });
                return;
            }
            res.json(newNote);
        });
    });
});

// Route to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    fs.readFile(path.join(__dirname, 'public', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to read notes from the database.' });
            return;
        }
        let notes = JSON.parse(data);
        const updatedNotes = notes.filter(note => note.id !== noteId);
        fs.writeFile(path.join(__dirname, 'public', 'db', 'db.json'), JSON.stringify(updatedNotes), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to delete the note from the database.' });
                return;
            }
            res.json({ message: 'Note deleted successfully.' });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Function to generate unique IDs (you can use any other method/library for generating unique IDs)
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}
