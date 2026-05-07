const pool = require("../config/db");

/* GET ALL CARDS */

exports.getCards = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
      credit_cards.*,
      banks.name AS bank_name

      FROM public.credit_cards

      LEFT JOIN public.banks
      ON credit_cards.bank_id = banks.id

      ORDER BY credit_cards.id DESC
    `);

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to fetch cards"
    });

  }

};


/* GET CARDS BY PAGE */

exports.getCardsByPage = async (req, res) => {

  const { slug } = req.params;

  try {

    const result = await pool.query(

      `SELECT
        credit_cards.*,
        banks.name AS bank_name,
        pages.slug AS page_slug

      FROM public.credit_cards

      LEFT JOIN public.banks
      ON credit_cards.bank_id = banks.id

      LEFT JOIN public.pages
      ON credit_cards.page_id = pages.id

      WHERE pages.slug = $1

      ORDER BY credit_cards.id DESC`,

      [slug]

    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to fetch page cards"
    });

  }

};


/* ADD CARD */

exports.addCard = async (req, res) => {

 const {
  name,
  bank_id,
  page_id,
  joining_fee,
  annual_fee,
  categories,
  benefits
} = req.body;


const parsedCategories = JSON.parse(categories);

const parsedBenefits = JSON.parse(benefits);


const image = req.file
  ? req.file.filename
  : "";

  try {

    const result = await pool.query(

      `INSERT INTO public.credit_cards
      (
        name,
        bank_id,
        page_id,
        joining_fee,
        annual_fee,
        image,
        categories,
        benefits
      )

      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)

      RETURNING *`,

      [
  name,
  bank_id,
  page_id,
  joining_fee,
  annual_fee,
  image,
  parsedCategories,
  parsedBenefits
]

    );

    res.json({
      message: "Card added successfully",
      card: result.rows[0]
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to add card"
    });

  }

};

/* DELETE CARD */

exports.deleteCard = async (req, res) => {

  const { id } = req.params;

  try {

    await pool.query(

      "DELETE FROM public.credit_cards WHERE id=$1",

      [id]

    );

    res.json({

      message: "Card deleted successfully"

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: "Failed to delete card"

    });

  }

};

/* UPDATE CARD */

exports.updateCard = async (req, res) => {

  const { id } = req.params;

  const {

    name,
    joining_fee,
    annual_fee

  } = req.body;

  try {

    const result = await pool.query(

      `UPDATE public.credit_cards

       SET
       name=$1,
       joining_fee=$2,
       annual_fee=$3

       WHERE id=$4

       RETURNING *`,

      [

        name,
        joining_fee,
        annual_fee,
        id

      ]

    );

    res.json({

      message: "Card updated successfully",

      card: result.rows[0]

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: "Failed to update card"

    });

  }

};