const express = require("express");
const router = express.Router();
const { onlyLoggedIn, onlyAdmin } = require("../middleware/accessControl");

const {
  create, remove,
} = require("../controllers/mediaManager");


router.route("/new").post(create);
router.route("/remove").post(onlyAdmin, remove);

module.exports = router;