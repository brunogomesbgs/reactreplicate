const express = require("express");
const router = express.Router();
const image_controller = require('../controllers/imageController');

router.route('/images/generate').post(image_controller.generate)

module.exports = router;