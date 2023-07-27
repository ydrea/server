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
      [...noviZapis, lon, lat] // Add lon and lat values to the parameter array
    );

    res.json(zaPis.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

const { Client } = require('pg');
const client =
  new Client(/* your PostgreSQL connection configuration */);

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
      lon,
      lat, // Assuming you have lon and lat fields for longitude and latitude
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

    await client.connect(); // Connect to the PostgreSQL database

    const zaPis = await client.query(
      'INSERT INTO foto_katalog (signatura, naziv, naziv_eng, opis, opis_eng, lokacija, datum_sni, kategorija, autor, copyright, copyright_holder, tagovi, doi, geom) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ST_SetSRID(ST_GeomFromText($14), 4326)) RETURNING *',
      noviZapis
    );

    await client.end(); // Close the connection to the PostgreSQL database

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

//update all
app.put('/photox', async (req, res) => {
  try {
    const { signatura, naziv } = req.body;
    const updateZapis = await pool.query(
      'UPDATE foto_katalog SET signatura=$1 naziv=$2',
      [...signatura, naziv]
    );
    res.json(`dodan xif u zapise`);
  } catch (err) {
    console.error(err.msg);
  }
});
