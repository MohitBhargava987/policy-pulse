const express = require('express');
const router = express.Router();
const nodeSchedule = require('node-schedule');
const ScheduledMessage = require('../models/ScheduledMessage');

// schedule a message: body { message, day: 'YYYY-MM-DD', time: 'HH:MM' }
router.post('/schedule', async (req, res) => {
    try {
        const { message, day, time } = req.body;
        if (!message || !day || !time) return res.status(400).json({ error: 'message, day, time required' });

        const [hour, minute] = time.split(':').map(Number);
        const dateStr = `${day}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`;
        const scheduledAt = new Date(dateStr);
        if (isNaN(scheduledAt)) return res.status(400).json({ error: 'invalid date/time' });

        const doc = await ScheduledMessage.create({ message, scheduledAt, status: 'pending' });

        // schedule job immediately in memory
        nodeSchedule.scheduleJob(scheduledAt, async () => {
            try {
                // insert final message into a collection (we'll reuse scheduled_messages with status done)
                await ScheduledMessage.updateOne({ _id: doc._id }, { $set: { status: 'done' } });
                console.log('Scheduled message executed:', doc._id);
            } catch (e) {
                console.error('Scheduled job error', e);
            }
        });

        res.json({ status: 'scheduled', id: doc._id, scheduledAt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// list scheduled messages
router.get('/schedule', async (req, res) => {
    const list = await ScheduledMessage.find().sort({ scheduledAt: 1 }).lean();
    res.json(list);
});

module.exports = router;
