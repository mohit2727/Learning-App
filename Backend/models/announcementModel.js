const mongoose = require('mongoose');

const announcementSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
