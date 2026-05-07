const express = require("express");

const router = express.Router();

const {

  getBanks,

  addBank,
  getBanksByPage

} = require("../controllers/bankController");



router.get("/", getBanks);

router.post("/", addBank);

router.get(
  "/page/:slug",
  getBanksByPage
);



module.exports = router;