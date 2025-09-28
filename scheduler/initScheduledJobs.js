const nodeSchedule = require('node-schedule');
const ScheduledMessage = require('../models/ScheduledMessage');

module.exports = async function initScheduledJobs() {
    try {
        const pending = await ScheduledMessage.find({ status: 'pending' }).lean();
        pending.forEach(p => {
            const when = new Date(p.scheduledAt);
            if (when > new Date()) {
                nodeSchedule.scheduleJob(when, async () => {
                    try {
                        await ScheduledMessage.updateOne({ _id: p._id }, { $set: { status: 'done' } });
                        console.log('Executed Scheduled Message.', p._id);
                    } catch (err) {
                        console.error('Error executing Scheduled message', err);
                    }
                });
                console.log('Scheduled job loaded for', p._id, when);
            } else {
                // past time - mark done to avoid re-running
                ScheduledMessage.updateOne({ _id: p._id }, { $set: { status: 'done' } }).catch(() => { });
            }
        });
    } catch (err) {
        console.error('initScheduledJobs error', err);
    }
}
