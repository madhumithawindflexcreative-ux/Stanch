require("dotenv").config();

const express = require("express");
const cors = require("cors");

const path = require("path");

const app = express();

const authRoutes = require("./routes/authRoutes");

const cardRoutes = require("./routes/cardRoutes");

app.use(cors());
app.use(express.json());

const bankRoutes = require("./routes/bankRoutes");

app.use("/api/banks", bankRoutes);

const categoryRoutes = require("./routes/categoryRoutes");

app.use("/api/categories", categoryRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/cards", cardRoutes);

const pool = require("./config/db");

pool.query("SELECT * FROM public.credit_cards")
.then(res => {
   console.log("CARDS TABLE WORKING");
   console.log(res.rows);
})
.catch(err => {
   console.log("DATABASE ERROR:", err);
});


const pageRoutes = require("./routes/pageRoutes");
app.use("/api/pages", pageRoutes);


app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use("/uploads", express.static("uploads"));







app.get("/", (req,res)=>{
  res.send("Backend Running");
});

app.listen(process.env.PORT, ()=>{
  console.log("Server running on port 5000");
});