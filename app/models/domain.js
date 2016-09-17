var mongoose = require('mongoose');
var schema = mongoose.Schema({
    name: String,
    timestamp: Number,
    records: Object
});

module.exports = mongoose.model('Domain', schema);
