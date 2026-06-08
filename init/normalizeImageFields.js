const mongoose = require("mongoose");
const Listing = require("../models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

function extractUrlFromMalformedImageString(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();

  // Case 1: stringified object text like { filename: 'listingimage', url: 'https://...' }
  const objectUrlMatch = trimmed.match(/url\s*:\s*['\"]([^'\"]+)['\"]/i);
  if (objectUrlMatch && objectUrlMatch[1]) return objectUrlMatch[1].trim();

  // Case 2: plain URL string
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "";
}

async function normalizeImageFields() {
  await mongoose.connect(MONGO_URL);

  const docs = await Listing.find({}).lean();
  let fixed = 0;
  let skipped = 0;

  for (const doc of docs) {
    if (typeof doc.image !== "string") continue;

    const url = extractUrlFromMalformedImageString(doc.image);
    if (!url) {
      skipped++;
      continue;
    }

    await Listing.updateOne(
      { _id: doc._id },
      {
        $set: {
          image: {
            filename: "listingimage",
            url,
          },
        },
      }
    );
    fixed++;
  }

  console.log("Fixed records:", fixed);
  console.log("Skipped records:", skipped);

  await mongoose.connection.close();
}

normalizeImageFields().catch((err) => {
  console.error(err);
  process.exit(1);
});




































