import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, isValidURL } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  app.get("/filteredimage", async (req: Request, res: Response) => {
    let { image_url } = req.query;

    if(!image_url || !isValidURL(image_url)) {
      res.status(400).send("Image url is required");
    }

    try {
      let filteredImage = await filterImageFromURL(image_url);

      res.sendFile(filteredImage, {}, function (err) {
        if (err) {
          console.log(err)
          res.status(500).send("Internal server error");
        } else {
          deleteLocalFiles([filteredImage]);
        }
      })
    } catch (err) {
      res.status(422).send(err);
    }

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