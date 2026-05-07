const express = require("express");

const router = express.Router();

const {

  getPages,

  addPage

} = require("../controllers/pageController");



router.get("/", getPages);

router.post("/", addPage);



module.exports = router;