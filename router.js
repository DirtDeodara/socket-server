const express = require('express');
const router = express.Router();
const cors = require('cors');

router.get('/', cors(), (req, res) => {
  res.send('** Server is up and running **', {
    "Access-Control-Allow-Origin": "*"
  })
});

module.exports = router;