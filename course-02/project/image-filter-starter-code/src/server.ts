import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  app.get("/filteredimage", async(req:express.Request, res:express.Response) => {

    // Log:
    console.log("Got filteredimage request with: ", req.query);

    // Sanity:
    if (!('image_url' in req.query)) {
      return res.status(400).send("image_url is required");
    }

    // Filter the image:
    try {
      var filteredImage = await filterImageFromURL(req.query.image_url);
    } catch (err) {
      console.log("Error: ", err);
      return res.status(400).send("Could not process " + req.query.image_url);
    }

    // Log:
    console.log("Saved filtered image locally at: ", filteredImage);

    // Send filtered image:
    res.sendFile(filteredImage, null, function(err) {

      // Cleanup:
      deleteLocalFiles([filteredImage]);

      // Return result:
      if (err) {
        console.log("Error sending file: ", err);
        return res.status(500).send("Internal error");
      } else {
        console.log("File sent: ", filteredImage);
        return res.status(200);
      }

    });

  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );


  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();