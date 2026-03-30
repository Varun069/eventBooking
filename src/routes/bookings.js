const express = require('express');
const { claimTicket } = require('../controllers/bookingController');

const router = express.Router();

router.post('/', claimTicket);

module.exports = router;
