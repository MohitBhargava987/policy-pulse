const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Account = require('../models/Account');
const LOB = require('../models/LOB');
const Carrier = require('../models/Carrier');

// Search policy info by username (firstName or email)
router.get('/policy/search', async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) return res.status(400).json({ error: 'username query param required' });
        console.log(username, 'username');
        console.log(User, 'User');

        const user = await User.findOne({
            $or: [
                { firstName: new RegExp(`^${username}$`, 'i') }, // Case Insensitive exact, in case I am searching-> for "Torie Buchanan".
                { email: new RegExp(`^${username}$`, 'i') }
            ]
        });
        if (!user) return res.status(404).json({ error: 'user not found' });

        const policies = await Policy.find({ user_id: user._id })
            .populate('agent_id')
            .populate('company_id')
            .populate('policy_category_id')
            .populate('account_id')
            .lean();

        res.json({ user, policies });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Aggregated policy count by each user
router.get('/policy/aggregated', async (req, res) => {
    try {
        const result = await Policy.aggregate([
            {
                $group: {
                    _id: '$user_id',
                    count: { $sum: 1 },
                    policies: { $push: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    user: 1,
                    count: 1,
                    policies: 1
                }
            }
        ]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
