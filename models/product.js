'use-strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = Schema({
    name: String,
    description: String,
    date: {type: Date, default: Date.now },
    image: String,
    precio: Number
});

module.exports = mongoose.model('Product', ProductSchema);