const pool = require("../config/db");

/* GET ALL BANKS */

exports.getBanks = async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM public.banks ORDER BY id ASC"
    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to fetch banks"
    });

  }

};

/* ADD BANK */

exports.addBank = async (req, res) => {

  const { name } = req.body;

  try {

    const result = await pool.query(

      `INSERT INTO public.banks (name)
       VALUES ($1)
       RETURNING *`,

      [name]

    );

    res.json({

      message: "Bank added successfully",

      bank: result.rows[0]

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: "Failed to add bank"

    });

  }

};

const getBanksByPage = async (req, res) => {

  try {

    const { slug } = req.params;

    const result = await pool.query(

      `
      SELECT b.*

      FROM page_banks pb

      JOIN banks b
      ON pb.bank_id = b.id

      JOIN pages p
      ON pb.page_id = p.id

      WHERE p.slug = $1
      `,

      [slug]

    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

};
exports.getBanksByPage = getBanksByPage;