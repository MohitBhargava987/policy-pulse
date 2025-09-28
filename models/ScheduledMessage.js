const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduledMessageSchema = new Schema({
    message: String,
    scheduledAt: Date,
    status: { type: String, enum: ['pending','done','cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScheduledMessage', ScheduledMessageSchema);
