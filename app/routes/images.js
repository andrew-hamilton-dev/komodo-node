var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Image = mongoose.model('Image');

/* /images */
router.get('/', function(req, res) {

  //default image list to descending date
  if (req.query.sort === undefined) {
    req.query.sort = "date-dsc"; //ascending;
  }

  var sort = req.query.sort;
  var page = req.query.page || 1;
  var limit = req.query.limit || 3;

  Image.paginate({limit: limit, page: page, sort: sort},function (err, images) {
    if (!err) {
      res.render('images/image-list', {images: images});
    } else {
      console.log(err);
      return res.send(404);
    }
  });
});

router.get('/upload', function(req, res) {
  res.render('images/upload-form', {});
});

//  Get Single Image by ID
router.get('/:id', function (req, res) {
  return Image.findById(req.params.id).exec(function (err, image) {

    if(image === undefined) return res.send(404);

    //images view expects a list so make one.
    var images = [image];

    if (!err) {
      res.render('images/image-single', {images: images});
    } else {
      console.log(err);
      return res.send(404);
    }
  });
});




module.exports = router;

