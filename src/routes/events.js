const express = require('express');
const { assembleEvents, forgeEvent, logEntry } = require('../controllers/eventController');

const router = express.Router();

router.get('/',              assembleEvents);
router.post('/',             forgeEvent);
router.post('/:id/attendance', logEntry);

module.exports = router;
