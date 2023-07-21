var exifr = require('exifr');

const dajFile = (req, res, next) => {
  if (!req.files)
    return res.status(400).json({ status: 'ne', message: 'maga' });
  next();
  //   try {
  //     exifr
  //       .parse(files)
  //       .then(output => console.log('Camera:', output.Make));
  //   } catch (error) {
  //     console.log(error);
  //   }
};
module.exports = dajFile;
