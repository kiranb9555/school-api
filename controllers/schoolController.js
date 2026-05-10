const db = require("../config/db");

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

exports.addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (
    !name ||
    !address ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  if (
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    return res.status(400).json({
      message: "Latitude and Longitude must be numbers"
    });
  }

  const sql =
    "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [name, address, latitude, longitude],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err
        });
      }

      res.status(201).json({
        message: "School added successfully",
        schoolId: result.insertId
      });
    }
  );
};

exports.listSchools = (req, res) => {
  const { latitude, longitude } = req.query;

  if (
    latitude === undefined ||
    longitude === undefined
  ) {
    return res.status(400).json({
      message: "Latitude and Longitude required"
    });
  }

  db.query(
    "SELECT * FROM schools",
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Database error"
        });
      }

      const schools = results.map((school) => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          school.latitude,
          school.longitude
        );

        return {
          ...school,
          distance: distance.toFixed(2) + " KM"
        };
      });

      schools.sort((a, b) => {
        return parseFloat(a.distance) - parseFloat(b.distance);
      });

      res.json({
        count: schools.length,
        schools
      });
    }
  );
};