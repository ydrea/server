var exifr = require('exifr');
const { asyncMiddleware } = require('middleware-async');

const dajExif = async (req, res, next) => {
  const imago = req.files;
  const exIf = await exifr.parse(imago);
  console.log('log', exIf);
  next();
};
module.exports(dajExif);
