const asyncHandler = require('express-async-handler');
const Announcement = require('../models/announcementModel');
const { invalidateCache } = require('../middleware/cacheMiddleware');

// @desc    Get all active announcements (Public/Student)
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(announcements);
});

// @desc    Get all announcements (Admin)
// @route   GET /api/announcements/all
// @access  Private/Admin
const getAllAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.json(announcements);
});

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
    const { title, body, image, isActive } = req.body;

    const announcement = new Announcement({
        title,
        body,
        image,
        isActive: isActive !== undefined ? isActive : true,
    });

    const createdAnnouncement = await announcement.save();
    invalidateCache('/announcements');
    res.status(201).json(createdAnnouncement);
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
    const { title, body, image, isActive } = req.body;

    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
        announcement.title = title || announcement.title;
        announcement.body = body || announcement.body;
        announcement.image = image || announcement.image;
        if (isActive !== undefined) announcement.isActive = isActive;

        const updatedAnnouncement = await announcement.save();
        invalidateCache('/announcements');
        res.json(updatedAnnouncement);
    } else {
        res.status(404);
        throw new Error('Announcement not found');
    }
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
        await announcement.deleteOne();
        invalidateCache('/announcements');
        res.json({ message: 'Announcement removed' });
    } else {
        res.status(404);
        throw new Error('Announcement not found');
    }
});

module.exports = {
    getAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};
