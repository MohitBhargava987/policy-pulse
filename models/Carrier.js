const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarrierSchema = new Schema({
    company_name: String
}, { timestamps: true });

module.exports = mongoose.model('Carrier', CarrierSchema);
