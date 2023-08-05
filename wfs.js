const express = require('express');
const axios = require('axios');
const app = express();

// Define a route for the WFS request
app.get('/wfs', async (req, res) => {
  try {
    // Set up the URL for the WFS request
    const wfsUrl = 'http://example.com/wfs'; // Replace with your WFS server URL
    const params = {
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: 'my_feature_type',
      // Replace with the name of the feature type you want to request
      outputFormat: 'application/json',
      // Add any other parameters specific to your WFS server and requirements
    };

    // Make the WFS request using axios
    const response = await axios.get(wfsUrl, { params });

    // Send the WFS response to the client
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error fetching WFS data.');
  }
});

// Start the server
// const port = 3000;
// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}`);
// });
