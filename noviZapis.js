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
      geom, // Use the geom variable that holds the POINT value
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
