

const admin = require("firebase-admin");
const { getDatabase } = require('firebase-admin/database');

const serviceAccount = require("../gmarketwashere-firebase-adminsdk-4cwlo-d4403801f8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gmarketwashere-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = getDatabase();

module.exports = db;
