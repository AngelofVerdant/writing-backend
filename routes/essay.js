const express = require("express");
const router = express.Router();
const { paginationMiddleware, sortOrderMiddleware, filterMiddleware, searchMiddleware } = require("../middleware/dataManipulation");
const { onlyAdmin } = require("../middleware/accessControl");

const {
  create, getAllPaginate, updateById, getById, deleteById, getAll,
} = require("../controllers/essay");

const validSortOrders = ['asc', 'desc'];
const defaultPage = 1;
const defaultLimit = 4;

router.route("/").post(onlyAdmin, create);
router.route("/paginate").get(
    onlyAdmin,
    (req, res, next) => sortOrderMiddleware(validSortOrders, req, res, next),
    paginationMiddleware(defaultPage, defaultLimit),
    searchMiddleware,
    filterMiddleware,
    getAllPaginate
);
router.route("/all").get(getAll);
router.route("/:essayId").get(getById);
router.route("/:essayId").patch(onlyAdmin, updateById);
router.route("/:essayId").delete(onlyAdmin, deleteById);

module.exports = router;