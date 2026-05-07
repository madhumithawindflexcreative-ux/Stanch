const pool = require("../config/db");

/* GET ALL PAGES */

exports.getPages = async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM public.pages ORDER BY id ASC"
    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to fetch pages"
    });

  }

};

/* ADD PAGE */

exports.addPage = async (req, res) => {

  const { name, slug } = req.body;

  try {

    const result = await pool.query(

      `INSERT INTO public.pages (name, slug)
       VALUES ($1, $2)
       RETURNING *`,

      [name, slug]

    );

    res.json({

      message: "Page added successfully",

      page: result.rows[0]

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: "Failed to add page"

    });

  }

};