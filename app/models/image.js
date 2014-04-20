var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var imageSchema = Schema({
    path: String,
    name: String,
    encoding: String,
    mimetype: String,
    extension: String,
    originalname: String,
    label: String,
    description: String,
    updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);