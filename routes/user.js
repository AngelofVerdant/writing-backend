const express = require("express");
const router = express.Router();
const { paginationMiddleware, sortOrderMiddleware, filterMiddleware, searchMiddleware } = require("../middleware/dataManipulation");
const { onlyLoggedIn, onlyAdmin } = require("../middleware/accessControl");

const {
  getAllPaginate, updateById, getById, getAll,
} = require("../controllers/user");

const validSortOrders = ['asc', 'desc'];
const defaultPage = 1;
const defaultLimit = 4;


router.route("/paginate").get(
    onlyAdmin,
    (req, res, next) => sortOrderMiddleware(validSortOrders, req, res, next),
    paginationMiddleware(defaultPage, defaultLimit),
    searchMiddleware,
    filterMiddleware,
    getAllPaginate
);
router.route("/all").get(getAll);
router.route("/:userId").patch(onlyAdmin, updateById);
router.route("/:userId").get(onlyAdmin, getById);
router.route("/:userId").patch(onlyAdmin, updateById);

module.exports = router;