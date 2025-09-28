// Seed script to run the worker against the sample CSV included in uploads/
const path = require('path');
const { Worker } = require('worker_threads');
const filePath = path.join(__dirname, '..', 'uploads', 'data-sheet - Node js Assesment (2) (1).csv');
const worker = new Worker(path.join(__dirname, '..', 'worker', 'uploadWorker.js'), { workerData: {
    filePath,
    fileName: path.basename(filePath),
    MONGO_URI: process.env.MONGO_URI,
    DB_NAME: process.env.DB_NAME || 'assignment_db'
}});
worker.on('message', m => console.log('Worker:', m));
worker.on('error', e => console.error('Worker error:', e));
worker.on('exit', c => console.log('Worker exited', c));
