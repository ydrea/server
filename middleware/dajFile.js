var exifr = require('exifr');

const dajFile = (req, res, next) => {
  if (!req.files)
    return res.status(400).json({ status: 'ne', message: 'maga' });
  next();
};
module.exports = dajFile;
