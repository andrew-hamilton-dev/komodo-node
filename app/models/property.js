var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var propertySchema = Schema({
    title: String,
    slug: String,
    address: {
      street: String,
      city: String,
      province: String,
      zip: String,
      latitude: String,
      longitude: String
    },
    features: [String],
    description: String,
    images: [{ type: Schema.Types.ObjectId, ref: 'Image' }],
    contact: {
        name: String,
        phone: String,
        email: String
    },
    updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);

