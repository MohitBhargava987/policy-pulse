const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LOBSchema = new Schema({
    category_name: String,
}, { timestamps: true });

module.exports = mongoose.model('LOB', LOBSchema);
