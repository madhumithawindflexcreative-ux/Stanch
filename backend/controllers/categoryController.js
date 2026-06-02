const pool = require("../config/db");

exports.getCategories = async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM public.categories ORDER BY id ASC"
    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to fetch categories"
    });

  }

};