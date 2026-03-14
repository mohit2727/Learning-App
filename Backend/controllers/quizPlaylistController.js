const asyncHandler = require('express-async-handler');
const QuizPlaylist = require('../models/quizPlaylistModel');
const { invalidateCache } = require('../middleware/cacheMiddleware');

// @desc    Get all quiz playlists
// @route   GET /api/quiz-playlists
// @access  Public
const getPlaylists = asyncHandler(async (req, res) => {
    let query = {};
    if (!req.user || req.user.role !== 'admin') {
        query.isActive = true;
    }
    const playlists = await QuizPlaylist.find(query).populate('quizzes', 'title totalQuestions duration').lean();

    if (req.user && req.user.role !== 'admin') {
        const playlistsWithStatus = playlists.map(p => ({
            ...p,
            hasAccess: req.user.purchasedPlaylists?.some(id => id.toString() === p._id.toString())
        }));
        return res.json(playlistsWithStatus);
    }

    res.json(playlists);
});

// @desc    Get playlist by ID
// @route   GET /api/quiz-playlists/:id
// @access  Public
const getPlaylistById = asyncHandler(async (req, res) => {
    const playlist = await QuizPlaylist.findById(req.params.id).populate('quizzes');

    if (playlist) {
        // Check access if student
        let hasAccess = false;
        if (req.user) {
            if (req.user.role === 'admin') {
                hasAccess = true;
            } else if (req.user.purchasedPlaylists && req.user.purchasedPlaylists.some(id => id.toString() === req.params.id)) {
                hasAccess = true;
            }
        }
        
        // If free, all have access (though playlists usually have prices)
        if (playlist.price === 0) hasAccess = true;

        res.json({ ...playlist._doc, hasAccess });
    } else {
        res.status(404);
        throw new Error('Playlist not found');
    }
});

// @desc    Create a quiz playlist
// @route   POST /api/quiz-playlists
// @access  Private/Admin
const createPlaylist = asyncHandler(async (req, res) => {
    const { title, description, image, price, quizzes } = req.body;

    const playlist = new QuizPlaylist({
        title,
        description,
        image,
        price: Number(price) || 0,
        quizzes: quizzes || [],
        isActive: false,
    });

    const createdPlaylist = await playlist.save();
    invalidateCache('/quiz-playlists');
    res.status(201).json(createdPlaylist);
});

// @desc    Update a quiz playlist
// @route   PUT /api/quiz-playlists/:id
// @access  Private/Admin
const updatePlaylist = asyncHandler(async (req, res) => {
    const { title, description, image, price, quizzes, isActive } = req.body;
    const playlist = await QuizPlaylist.findById(req.params.id);

    if (playlist) {
        playlist.title = title || playlist.title;
        playlist.description = description || playlist.description;
        playlist.image = image || playlist.image;
        playlist.price = price !== undefined ? Number(price) : playlist.price;
        playlist.quizzes = quizzes || playlist.quizzes;
        playlist.isActive = isActive !== undefined ? isActive : playlist.isActive;

        const updatedPlaylist = await playlist.save();
        invalidateCache('/quiz-playlists');
        res.json(updatedPlaylist);
    } else {
        res.status(404);
        throw new Error('Playlist not found');
    }
});

// @desc    Delete a quiz playlist
// @route   DELETE /api/quiz-playlists/:id
// @access  Private/Admin
const deletePlaylist = asyncHandler(async (req, res) => {
    const playlist = await QuizPlaylist.findById(req.params.id);

    if (playlist) {
        await playlist.deleteOne();
        invalidateCache('/quiz-playlists');
        res.json({ message: 'Playlist removed' });
    } else {
        res.status(404);
        throw new Error('Playlist not found');
    }
});

module.exports = {
    getPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
};
