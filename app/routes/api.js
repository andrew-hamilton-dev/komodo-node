var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var fs = require('fs');

var Image = mongoose.model('Image');

// middleware to use for all requests, process requests before they hit api functions
router.use(function(req, res, next) {
  console.log('Accessing Image API');
  next(); // make sure we go to the next routes and don't stop here
});

// route middleware to validate :name
// router.param('name', function(req, res, next, name) {
//   // do validation on name here
//   // blah blah validation
//   // log something so we know its working
//   console.log('doing name validations on ' + name);

//   // once validation is done save the new item in the req
//   req.name = name;
//   // go to the next thing
//   next();
// });


router.route('/images')

  //get all images
  .get(function(req, res) {
    Image.find().exec(function (err, images) {
      if (!err) {
        res.send(images);
      } else {
        console.log(err);
        return res.send(404);
      }
    });
  })

  .post(uploadImage, saveImage);

router.route('/images/:id')

  //  Get Single Image by ID
  .get(function (req, res) {
    return Image.findById(req.params.id).exec(function (err, image) {
      if(image === undefined) return res.send({"message":"Image not found: " + req.body._id });

      if (!err) {
        res.send(image);
      } else {
        console.log(err);
        return res.send(404);
      }
    });
  })

  // Update Image by ID
  .put(function (req, res) {
    return Image.findById(req.body._id, function (err, image) {
      if(image === undefined) return res.send({"message":"Image not found: " + req.body._id });

      image.label = req.body.label;
      image.description = req.body.description;

      //always set this with code regardless of what data is sent
      image.updated = new Date();

      return image.save(function (err) {
        if (!err) {
          console.log("Image Update: " + image.name);
          return res.send({"message":"Updated " + image._id,"image":image});
        } else {
          console.log(err);
          return res.send({"message":"Failed Update " + image._id,"image":image});
        }
      });
    });
  })

  // Delete a single image
  .delete(function (req, res) {
    return Image.findById(req.params.id, function (err, image) {

      if(image === undefined) return res.send({"message":"Image not found: " + res.body._id });

       var imagePath = "./app/public/uploads/" + image.name;

      //remove from database first
      return image.remove(function (err) {
        if (!err) {
          //remove from file system
          fs.unlink(imagePath, function (err) {
            if (err) throw err;
            console.log('successfully deleted ' + imagePath);
          });
          return res.send({"message":"Deleted" + imagePath,"image":image});
        } else {
          console.log(err);
          return res.send({"error":"Delete Failed on " + imagePath,"image":image});
        }
      });
    });
  });

  // file is automatically saved to /public/uploads, let's just set 
  function uploadImage(req, res, next) {
    if (req.files) {
      req.body.path = req.files.file.path.split("/").slice(-2).join("/");
      req.body.name = req.files.file.name;
      req.body.encoding = req.files.file.encoding;
      req.body.mimetype = req.files.file.mimetype;
      req.body.extension = req.files.file.extension;
      req.body.originalname = req.files.file.originalname;
      req.body.label = req.body.label;
      req.body.description = req.body.description;
    }
    next();
  }
 
  // file upload is optional, it could have come before
  function saveImage(req, res) {
    //only save files with image extenstions (maybe swtich to mimetype)
    if (['gif', 'jpg', 'jpeg', 'png'].indexOf(req.body.extension.toLowerCase()) >= 0) {


      var image = new Image({
          "path": "/uploads/" + req.body.name,
          "name": req.body.name,
          "encoding": req.body.encoding,
          "mimetype": req.body.mimetype,
          "extension": req.body.extension,
          "originalname": req.body.originalname,
          "label": req.body.label,
          "description": req.body.description,
          "updated": new Date()
      });

      image.save(function(err) {
        if (err) return res.send(err.message, 500);
        //move file from temp folder to public
        var newPath = "./app/public/uploads/" + req.body.name;
        fs.rename(req.body.path, newPath, function(err) {
            console.log(req.body.path + " -> " + newPath);
            if ( err ) {
              console.log('ERROR: ' + err);
            } else {
              //file has been uploaded to db + filesystem, display it now
              res.redirect('/images/' + image._id);
            }
        });
      });
    } else {
      //delete uploaded file
      fs.unlink(req.body.path, function (err) {
        if (err) throw err;
        console.log('successfully deleted ' + req.body.path);
      });
      res.render('images/upload-fail', {"image": req.body});
    }
  }

module.exports = router;