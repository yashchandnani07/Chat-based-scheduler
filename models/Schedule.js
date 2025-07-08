const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
    },
    eventLink: {
        type: String,
    },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
