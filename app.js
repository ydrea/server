const express = require('express');
const path = require('path');
const pool = require('./db');
const fileUpload = require('express-fileupload');
const dajExif = require('./middleware/dajExif');
thumb = require('node-thumbnail').thumb;

const PORT = process.env.PORT || 3500;
const app = express();

app.use('/public', express.static('public'));

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
    const thumbPath = `${__dirname}/uploads/thumbs`;
    console.log(file, 'ALO', thumbPath);
    file.mv(`${__dirname}/public/${file.name}`, err => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
      res.json({
        fileName: file.name,
        filePath: `/public/${file.name}`,
      });
    });
  }
);
// novi zapis
app.post('/novi', async (req, res) => {
  try {
    const {
      signatura,
      naziv,
      naziv_eng,
      opis,
      opis_eng,
      lokacija,
      datum_sni,
      kategorija,
      autor,
      copyright,
      copyright_holder,
      tagovi,
      doi,
      lon, //  lon and lat => req.body
      lat,
    } = req.body;

    const geom = `POINT(${lon} ${lat})`;

    const noviZapis = [
      signatura,
      naziv,
      naziv_eng,
      opis,
      opis_eng,
      lokacija,
      datum_sni,
      kategorija,
      autor,
      copyright,
      copyright_holder,
      tagovi,
      doi,
      geom,
    ];

    const zaPis = await pool.query(
      'INSERT INTO foto_katalog (signatura, naziv, naziv_eng, opis, opis_eng, lokacija, datum_sni, kategorija, autor, copyright, copyright_holder, tagovi, doi, geom) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ST_SetSRID(ST_MakePoint($14, $15), 4326)) RETURNING *',
      [...noviZapis, lon, lat]
    );

    res.json(zaPis.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

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

//update one
app.put('/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { exifTrunc } = req.body;
    const updateZapis = await pool.query(
      'UPDATE foto_katalog SET exifTrunc=$1 WHERE id=$2',
      [exifTrunc, id]
    );
    res.json(`dodan exifTrunc u zapis br. ${id}`);
  } catch (err) {
    console.error(err.msg);
  }
});

//delete one
app.delete('/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteZapis = await pool.query(
      'DELETE FROM foto_katalog WHERE id=$1',
      [id]
    );
    res.json(`Obrisan zapis br. ${id}`);
  } catch (err) {
    console.error(err.msg);
  }
});

app.listen(PORT, () => console.log(`samslu ${PORT}`));
