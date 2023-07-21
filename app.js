const express = require('express');
const path = require('path');
const pool = require('./db');
const fileUpload = require('express-fileupload');
const PORT = process.env.PORT || 3500;
const app = express();

//get all
app.get('/photos', async (req, res) => {
  try {
    const fotos = await pool.query('SELECT * FROM foto_katalog');
    res.json(fotos.rows);
  } catch (err) {
    console.error(err.msg);
  }
});

//get one
app.get('/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const foto = await pool.query(
      'SELECT * FROM foto_katalog WHERE id=$1',
      [id]
    );
    res.json(foto.rows[0]);
  } catch (err) {
    console.error(err.msg);
  }
});
//img upload
app.post(
  '/upload',
  fileUpload({ createParentPath: true }),
  (req, res) => {
    if (req.files === null) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    const file = req.files.file;
    console.log(file);
    file.mv(`${__dirname}/Rleaf/public/uploads/${file.name}`, err => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
      res.json({
        fileName: file.name,
        filePath: `/uploads/${file.name}`,
      });
    });
  }
);

// img to db
app.post('/img2db', async (req, res) => {
  try {
    const newImage = [fileName, filePath];
    const newImg = await pool.query(
      'INSERT INTO foto_katalog (newImage) VALUES($1) RETURNING *',
      newImage
    );
    res.json(newImg.rows[0]);
  } catch (err) {
    console.error(err.msg);
  }
});
//exif to db
app.post('/exifr', async (req, res) => {
  try {
    const { exifTrunc } = req.body;
    const newExifr = await pool.query(
      'INSERT INTO foto_katalog (exifTrunc) VALUES($1) RETURNING *',
      [exifTrunc]
    );
    res.json(newExifr.rows[0]);
  } catch (error) {}
});

app.listen(PORT, () => console.log(`samslu ${PORT}`));
