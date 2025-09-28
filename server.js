require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Routes
const uploadRouter = require('./routes/upload');
const policyRouter = require('./routes/policy');
const scheduleRouter = require('./routes/schedule');

app.use('/api', uploadRouter);
app.use('/api', policyRouter);
app.use('/api', scheduleRouter);

// Connect to MongoDB via mongoose
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('Please set MONGO_URI in .env');
    process.exit(1);
}

mongoose.connect(MONGO_URI, {
    dbName: process.env.DB_NAME || 'assignment_db'
}).then(() => {
    console.log('Connected to MongoDB');
    // initialize scheduled jobs after DB conection
    require('./scheduler/initScheduledJobs')();
    app.listen(PORT, () => {
        console.log('Server listening on port', PORT);
    });
}).catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
});
