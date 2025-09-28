const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PolicySchema = new Schema({
    policy_number: String,
    policy_start_date: Date,
    policy_end_date: Date,
    policy_category_id: { type: Schema.Types.ObjectId, ref: 'LOB' },
    company_id: { type: Schema.Types.ObjectId, ref: 'Carrier' },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    agent_id: { type: Schema.Types.ObjectId, ref: 'Agent' },
    account_id: { type: Schema.Types.ObjectId, ref: 'Account' }
}, { timestamps: true });

module.exports = mongoose.model('Policy', PolicySchema);
