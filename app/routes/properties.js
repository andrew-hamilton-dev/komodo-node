var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Property = require('../models/property');
var Image = require('../models/image');

/*  /properties */

router.get('/', function(req, res) {
  var dateSort = "-1";  //descending
  if (req.query.dateSort === "asc") {
    dateSort = "1"; //ascending;
  }
  Property.find().populate('images').sort({'updated': dateSort}).exec(function (err, properties) {
    if (!err) {
      res.render('properties/properties', {properties: properties});
    } else {
      console.log(err);
      return res.send(404);
    }
  });
});

// POST to CREATE NEW Property
router.post('/', function (req, res) {

  var property = new Property({
    title: req.body.title,
    slug: req.body.slug,
    description: req.body.description,
    address: {
      street: req.body.street,
      city: req.body.city,
      province: req.body.province,
      zip: req.body.zip,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    },
    features: req.body.features.split(","),
    contact:  {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email
    },
    images: []
  });

  property.save(function (err) {
    if (!err) {
      return console.log("Created Property: " + property.title);
    } else {
      console.log(err);
      return res.render('error', {message: "Unable to Create Property", error:err});
    }
  });

  return res.redirect("/properties");
});

//new property form
router.get('/add', function(req, res) {
  res.render('properties/add-property-form', {});
});

//  Get Single Property by ID
router.get('/:id', function (req, res) {
  return Property.findById(req.params.id).populate('images').exec(function (err, property) {

    if(property === undefined) return res.send(404);

    //properties view expects a list so make one.
    var properties = [property];

    if (!err) {
      res.render('properties/properties', {properties: properties});
    } else {
      console.log(err);
      return res.send(404);
    }
  });
});


// Update by ID
router.put('/:id', function (req, res) {
  return Property.findById(req.params.id, function (err, property) {

    var emptyValue = "unknown";

    if(property === undefined) return res.send(404);

    if (property.title !== undefined) {
      property.title = req.body.title;
    } else {
      property.title = emptyValue;
    }

    if (property.slug !== undefined) {
      property.slug = req.body.slug;
    } else {
      property.slug = emptyValue;
    }  

    if (property.address !== undefined) {
      property.address = req.body.address;
    } else {
      property.address = {
        "street": emptyValue,
        "city": emptyValue,
        "province": emptyValue,
        "zip": emptyValue,
        "latitude": emptyValue,
        "longitude": emptyValue
      }     
    }

    if (property.features !== undefined) {
      property.features = req.body.features;
    } else {
      property.features = [];
    }  

    if (property.description !== undefined) {
      property.description = req.body.description;
    } else {
      property.description = emptyValue;
    }  

    if (property.images !== undefined) {
      property.images = req.body.images;
    } else {
      property.images = [];
    }

    if (property.contact !== undefined) {
      property.contact = req.body.contact;
    } else {
      property.contact = {
        "name": emptyValue,
        "phone": emptyValue,
        "email": emptyValue
      }     
    }

    //always set this with code regardless of what data is sent
    property.updated = new Date();

    return property.save(function (err) {
      if (!err) {
        console.log("Property Update: " + property.title);
      } else {
        console.log(err);
        return res.send(404);
      }

      return res.send(property);
    });
  });
});


// Bulk delete all properties
// router.delete('/', function (req, res) {
//   Property.remove(function (err) {
//     if (!err) {
//       console.log("All Properties Deleted!  Awwwww Crap!");
//       return res.send('');
//     } else {
//       console.log(err);
//       return res.send(404);
//     }
//   });
// });

// Delete a single property
router.delete('/:id', function (req, res) {
  return Property.findById(req.params.id, function (err, property) {

    if(property === undefined) return res.send(404);

    return property.remove(function (err) {
      if (!err) {
        console.log("Deleted Property: " + property.title);
        return res.send('');
      } else {
        console.log(err);
        return res.send(404);
      }
    });
  });
});


module.exports = router;

