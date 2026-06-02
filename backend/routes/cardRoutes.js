const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const {
  getCards,
  getCardsByPage,
  addCard,
  deleteCard,
  updateCard
  
} = require("../controllers/cardController");

/* ALL CARDS */

router.get("/", getCards);

router.post(

  "/",

  upload.single("image"),

  addCard

);

/* PAGE WISE CARDS */

router.get("/:slug", getCardsByPage);

router.delete("/:id", deleteCard);

router.put("/:id", updateCard);

module.exports = router;