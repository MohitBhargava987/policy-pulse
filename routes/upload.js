const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Worker } = require('worker_threads');


const upload = multer({ dest: path.join(__dirname, '../uploads/') });

router.post('/upload', upload.single('file'), async (req, res) => {
    console.log(req.file, 'filefile');
    
    if (!req.file) return res.status(400).json({ error: 'file required (field name: file)' });
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Spawn Worker to parse and insert
    const worker = new Worker(path.join(__dirname, '../worker/uploadWorker.js'), {
        workerData: {
            filePath,
            fileName,
            MONGO_URI: process.env.MONGO_URI,
            DB_NAME: process.env.DB_NAME || 'assignment_db'
        }
    });

    worker.on('message', (msg) => {
        console.log('Worker message', msg);
    });
    worker.on('error', (err) => {
        console.error('Worker error', err);
    });
    worker.on('exit', (code) => {
        console.log('Worker exited with code', code);
    });

    res.json({ status: 'processing', file: req.file.originalname, message: "Data processing is in progress, Please check DB records after sometime." });
});

module.exports = router;
