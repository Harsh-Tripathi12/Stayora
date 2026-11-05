if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const mongoose = require("mongoose");
const User = require("../models/user");

const LOCAL_DB_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL || LOCAL_DB_URL;

async function main() {
    try {
        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 5000,
            tlsAllowInvalidCertificates: process.env.NODE_ENV !== "production"
        });
        console.log("Connected to MongoDB Atlas.");
    } catch (err) {
        console.warn("Could not connect to Atlas DB. Falling back to local MongoDB...");
        await mongoose.connect(LOCAL_DB_URL);
        console.log("Connected to local MongoDB.");
    }

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@wanderlust.com";

    const existingUser = await User.findOne({ username: adminUsername });

    if (!existingUser) {
        const newAdmin = new User({
            username: adminUsername,
            email: adminEmail,
            isAdmin: true
        });
        await User.register(newAdmin, adminPassword);
        console.log(`✅ Universal Admin created successfully!`);
        console.log(`   Username: ${adminUsername}`);
        console.log(`   Password: ${adminPassword}`);
    } else {
        existingUser.isAdmin = true;
        if (adminPassword) {
            await existingUser.setPassword(adminPassword);
        }
        await existingUser.save();
        console.log(`✅ Admin account updated successfully!`);
        console.log(`   Username: ${adminUsername}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   Admin role: active`);
    }

    await mongoose.disconnect();
    console.log("Disconnected from DB.");
}

main().catch((err) => {
    console.error("Error creating admin:", err);
    process.exit(1);
});
