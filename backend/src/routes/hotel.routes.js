const express = require('express');
const router = express.Router();

const { createHotel } = require('../controllers/hotel.controller');

router.post('/', createHotel);

module.exports = router;