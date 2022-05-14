//initializes Multer GridFs Storage engine (including MongoDB) and defines middleware function.
const util = require("util");
const multer = require("multer");

const mongoose= require("mongoose");
const Grid = require('gridfs-stream');
const { GridFsStorage } = require("multer-gridfs-storage");
const dbConfig = require("../config/db");
const url=dbConfig.url;

const promise = mongoose.connect(url, { useNewUrlParser: true });

const conn = mongoose.connection;
// const conn= mongoose.connect(
//     url
//   ).then(()=> console.log("Connection is established"));

  let gfs;

  conn.once('open',() => {
    gfs = Grid(conn, mongoose.mongo);
    gfs.collection(dbConfig.imgBucket);
  });

var storage = new GridFsStorage({
    db: promise,
  url: url + dbConfig.database,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];
    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-h4i-${file.originalname}`;
      return filename;
    }
    return {
      bucketName: dbConfig.imgBucket,
      filename: `${Date.now()}-h4i-${file.originalname}`
    };
  }
});
var uploadFiles = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;