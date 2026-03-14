const mongoose = require('mongoose');

const quizPlaylistSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: '',
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        quizzes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Test',
            },
        ],
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const QuizPlaylist = mongoose.model('QuizPlaylist', quizPlaylistSchema);

module.exports = QuizPlaylist;
