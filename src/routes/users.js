const express = require('express');
const { fetchMissions } = require('../controllers/userController');

const router = express.Router();

router.get('/:id/bookings', fetchMissions);

module.exports = router;
