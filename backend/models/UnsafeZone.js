const mongoose = require("mongoose");

const unsafeZoneSchema = new mongoose.Schema(
{
title: {
type: String,
required: true,
trim: true,
maxlength: 120,
},

level: {
type: String,
enum: ["High Risk", "Medium Risk", "Low Lighting"],
required: true,
},

latitude: {
type: Number,
required: true,
min: -90,
max: 90,
},

longitude: {
type: Number,
required: true,
min: -180,
max: 180,
},

radius: {
type: Number,
default: 500,
min: 50,
max: 5000,
},

description: {
type: String,
default: "",
maxlength: 500,
},

source: {
type: String,
default: "community",
},
},
{
timestamps: true,
}
);

module.exports = mongoose.model("UnsafeZone", unsafeZoneSchema);