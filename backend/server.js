const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

/* POSTGRESQL CONNECTION */

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ma_dsaloans",
  password: "12345678",
  port: 5432,
  options: "-c search_path=public"
});


pool.query(`
CREATE TABLE IF NOT EXISTS public.otp_verification (
id SERIAL PRIMARY KEY,
mobile VARCHAR(10) NOT NULL,
otp VARCHAR(6) NOT NULL,
expires_at TIMESTAMP,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.users (
id SERIAL PRIMARY KEY,
mobile VARCHAR(10) UNIQUE,
email VARCHAR(150),
name VARCHAR(150),
google_id VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id),
token TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`)
.then(() => {
console.log("Tables verified/created successfully");
})
.catch(err => {
console.error("Table creation error:", err);
});

/* TEST DATABASE CONNECTION */

pool.connect()
.then(() => {
  console.log("Connected Database: ma_dsaloans");
})
.catch(err => {
  console.error("Database connection error:", err);
});

pool.query("SHOW search_path")
.then(res => {
  console.log("Search Path:", res.rows);
});

/* SEND OTP */

app.post("/send-otp", async (req, res) => {

  const { mobile } = req.body;

  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  console.log("Generated OTP for", mobile, "=", otp);

  try {

    await pool.query(
      `INSERT INTO public.otp_verification (mobile, otp, expires_at)
       VALUES ($1,$2,NOW() + INTERVAL '5 minutes')`,
      [mobile, otp]
    );

    res.json({
      message: "OTP generated successfully. Check backend terminal."
    });

  } catch (err) {

    console.error("OTP insert error:", err);
    res.status(500).json({ message: "OTP send failed" });

  }

});

/* VERIFY OTP */

app.post("/verify-otp", async (req, res) => {

  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile and OTP required" });
  }

  try {

    const result = await pool.query(
      `SELECT * FROM public.otp_verification
       WHERE mobile=$1
       ORDER BY id DESC
       LIMIT 1`,
      [mobile]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "OTP not found" });
    }

    const record = result.rows[0];

    /* CHECK OTP EXPIRY */

    if (new Date() > new Date(record.expires_at)) {
      return res.status(401).json({ message: "OTP expired" });
    }

    /* VERIFY OTP */

    if (String(record.otp) !== String(otp)) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    /* CHECK IF USER EXISTS */

    const user = await pool.query(
      "SELECT * FROM public.users WHERE mobile=$1",
      [mobile]
    );

    /* CREATE USER IF NOT EXISTS */

    if (user.rows.length === 0) {

      await pool.query(
        "INSERT INTO public.users (mobile) VALUES ($1)",
        [mobile]
      );

    }

    /* DELETE USED OTP */

    await pool.query(
      "DELETE FROM public.otp_verification WHERE mobile=$1",
      [mobile]
    );

    res.json({
      message: "Login successful"
    });

  } catch (err) {

    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Server error while verifying OTP" });

  }

});


app.post("/google-login", async (req, res) => {

const { email, name, google_id } = req.body;

try{

const user = await pool.query(
"SELECT * FROM users WHERE email=$1",
[email]
);

if(user.rows.length === 0){

await pool.query(
"INSERT INTO users (email,name,google_id) VALUES ($1,$2,$3)",
[email,name,google_id]
);

}

res.json({
message:"Google login successful"
});

}catch(err){

console.log(err);
res.status(500).json({message:"Google login failed"});

}

});

/* START SERVER */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});