const express = require('express');
const path = require('path');
const pool = require('./db');
const fileUpload = require('express-fileupload');
const cors = require('cors');
thumb = require('node-thumbnail').thumb;

const PORT = process.env.PORT || 3500;

const app = express();

//m`wares
app.use(cors({ origin: '*' }));
app.use('/public', express.static('public'));
app.use(express.json());

//get all
app.get('/photos', async (req, res) => {
  try {
    const fotos = await pool.query('SELECT * FROM foto_katalog');
    res.json(fotos.rows);
  } catch (err) {
    console.error(err.message);
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
    console.log(req.body);
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
      //   // url_image,
      //   // url_thumb,
    } = req.body;

    const geom = `POINT(${lon} ${lat})`;
    console.log(geom);

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
    console.log(noviZapis);
    const zaPis = await pool.query(
      'INSERT INTO foto_katalog (signatura, naziv, naziv_eng, opis, opis_eng, lokacija, datum_sni, kategorija, autor, copyright, copyright_holder, tagovi, doi, geom) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ST_GeomFromText($14)) RETURNING *',
      noviZapis
    );
    console.log(zaPis);
    res.json(zaPis.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

//update one
app.put('/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { signatura } = req.body;
    const updateZapis = await pool.query(
      'UPDATE foto_katalog SET signatura=$1 WHERE id=$2',
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

//search
// app.get('search/:tag', async (req, res) => {
//   console.log(req.params);
//   const queryBy = new RegExp(req.params?.tagovi, 'i');
//   if (queryBy !== null) {
//     try {
//       const searchRez = await find({ exifr: queryBy });
//       res.json(searchRez);
//     } catch (err) {
//       console.error(err.msg);
//     }
//   } else {
//     res.status(404);
//   }
// });

app.listen(PORT, () => console.log(`samslu ${PORT}`));
