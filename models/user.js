const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const passportLocalMongoosePlugin =
    passportLocalMongoose && passportLocalMongoose.default
        ? passportLocalMongoose.default
        : passportLocalMongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoosePlugin);

module.exports = mongoose.model("User", userSchema);
