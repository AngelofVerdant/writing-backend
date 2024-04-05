const express = require("express");
const router = express.Router();
const { onlyLoggedIn } = require("../middleware/accessControl");

const {
  create, remove,
} = require("../controllers/documentManager");


router.route("/new").post(onlyLoggedIn, create);
router.route("/remove").post(onlyLoggedIn, remove);

module.exports = router;