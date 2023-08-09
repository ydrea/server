const express = require('express');
const path = require('path');
const pool = require('./db');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const axios = require('axios');
// const dbgeo = require('dbgeo');
// const geojsonhint = require('geojsonhint');
thumb = require('node-thumbnail').thumb;

const PORT = process.env.PORT || 3500;

const app = express();

//m`wares
app.use(cors({ origin: '*' }));
app.use('/public', express.static('public'));
app.use(express.json());

//get marker coordinates per photo
app.get('/json_photos', async (req, res) => {
  try {
    const jsonPhotoCoordinates = await pool.query(
      'SELECT signatura, ST_AsGeoJSON(geom, 6) AS geometry FROM foto_katalog_rank' //
    );
    res.json(jsonPhotoCoordinates.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//just coords
app.get('/coords', async (req, res) => {
  try {
    const coords = await pool.query(
      'SELECT ST_AsGeoJSON(geom, 6) AS geometry FROM foto_katalog_rank'
    );
    res.json(coords.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//ranks
app.get('/ranks', async (req, res) => {
  try {
    const ranks = await pool.query(
      'SELECT CAST(rank_number AS INTEGER) FROM foto_katalog_rank'
      // [rank_number]
    );
    res.json(ranks.rows);
  } catch (err) {
    console.error(err.message);
  }
});
//rank+sig
app.get('/rank', async (req, res) => {
  try {
    const rank_number = req.query.rank_number;
    const rank = await pool.query(
      'SELECT CAST(rank_number AS INTEGER), signatura FROM foto_katalog_rank WHERE rank_number = $1',
      [rank_number]
    );
    res.json(rank.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//{"type" : "FeatureCollection", "features" : [{"type": "Feature", "geometry": {"type":"Point","coordinates":[1,1]}, "properties": {"id": 1, "name": "one"}}, {"type": "Feature", "geometry": {"type":"Point","coordinates":[2,2]}, "properties": {"id": 2, "name": "two"}}, {"type": "Feature", "geometry": {"type":"Point","coordinates":[3,3]}, "properties": {"id": 3, "name": "three"}}]}

//get wfs TKZ
app.get('/wfs_tkz', async (req, res) => {
  try {
    const wfsUrl = 'https://landscape.agr.hr/qgis/wfs';
    const params = {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'tema_koristenje_zemljista',
      outputFormat: 'application/json',
      srsName: 'epsg:4326',
    };
    const response = await axios.get(wfsUrl, { params });
    const geojsonData = response.data;
    res.setHeader('Content-Type', 'application/json');
    res.send(geojsonData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error fetching WFS data.');
  }
});

//get all photos
app.get('/photos', async (req, res) => {
  try {
    const fotos = await pool.query('SELECT * FROM foto_katalog');
    res.json(fotos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//get all + rank
app.get('/photosr', async (req, res) => {
  try {
    const fotos = await pool.query('SELECT * FROM foto_katalog_rank');
    res.json(fotos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//get one id from ranked
app.get('/photosr/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const foto = await pool.query(
      'SELECT * FROM foto_katalog_rank WHERE id=$1',
      [id]
    );
    res.json(foto.rows[0]);
  } catch (err) {
    console.error(err.msg);
  }
});

//get one img
app.get('/public/:signatura', async (req, res) => {
  try {
    const { signatura } = req.params;
    const foto = await pool.query(
      'SELECT * FROM foto_katalog WHERE signatura=$1',
      [signatura]
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
      [signatura, id]
    );
    res.json(`izmijenjen zapis br. ${id}`);
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

app.listen(PORT, () => console.log(`Slušam port ${PORT}`));
