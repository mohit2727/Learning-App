const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAnnouncements); // Public (or protect if you only want logged-in users to see them)
router.get('/all', protect, admin, getAllAnnouncements);
router.post('/', protect, admin, createAnnouncement);
router.put('/:id', protect, admin, updateAnnouncement);
router.delete('/:id', protect, admin, deleteAnnouncement);

module.exports = router;
