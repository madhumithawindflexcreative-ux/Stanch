const pool = require("../config/db");

/* SEND OTP */

exports.sendOtp = async (req, res) => {

  const { mobile } = req.body;

  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({
      message: "Invalid mobile number"
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  console.log("Generated OTP:", otp);

  try {

    await pool.query(
      `INSERT INTO public.otp_verification 
       (mobile, otp, expires_at)
       VALUES ($1,$2,NOW() + INTERVAL '5 minutes')`,
      [mobile, otp]
    );

    res.json({
      message: "OTP generated successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "OTP send failed"
    });

  }

};

/* VERIFY OTP */

exports.verifyOtp = async (req, res) => {

  const { mobile, otp } = req.body;

  try {

    const result = await pool.query(
      `SELECT * FROM otp_verification
       WHERE mobile=$1
       ORDER BY id DESC
       LIMIT 1`,
      [mobile]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "OTP not found"
      });
    }

    const record = result.rows[0];

    if (String(record.otp) !== String(otp)) {
      return res.status(401).json({
        message: "Invalid OTP"
      });
    }

    const user = await pool.query(
      `SELECT * FROM users WHERE mobile=$1`,
      [mobile]
    );

    if (user.rows.length === 0) {

      await pool.query(
        `INSERT INTO users (mobile) VALUES ($1)`,
        [mobile]
      );

    }

    res.json({
      message: "Login successful"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "OTP verification failed"
    });

  }

};

/* GOOGLE LOGIN */

exports.googleLogin = async (req, res) => {

  const { email, name, google_id } = req.body;

  try {

    const user = await pool.query(
      `SELECT * FROM users WHERE email=$1`,
      [email]
    );

    if (user.rows.length === 0) {

      await pool.query(
        `INSERT INTO users (email,name,google_id)
         VALUES ($1,$2,$3)`,
        [email, name, google_id]
      );

    }

    res.json({
      message: "Google login successful"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Google login failed"
    });

  }

};