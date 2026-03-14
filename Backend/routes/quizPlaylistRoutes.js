const express = require('express');
const router = express.Router();
const {
    getPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
} = require('../controllers/quizPlaylistController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getPlaylists);
router.get('/:id', protect, getPlaylistById);
router.post('/', protect, admin, createPlaylist);
router.put('/:id', protect, admin, updatePlaylist);
router.delete('/:id', protect, admin, deletePlaylist);

module.exports = router;
