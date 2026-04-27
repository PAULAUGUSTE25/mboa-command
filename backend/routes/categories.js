const express = require('express');
const router = express.Router();
const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const categories = await db.queryAll('SELECT * FROM categories ORDER BY id');
  res.json({ data: categories });
}));

module.exports = router;
