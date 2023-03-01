//richiamo mongoose per creare lo schema del documento
const mongoose = require('mongoose');

//creo lo schema di user
const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    verificationToken: {
        type: String,
        required: true,
        default: 'ciao'
    },
    role: {
        type: String,
        required: true,
        default: 'basic'
    },
    resetToken: {
        type: String
    },
    resetTokenExpiration: {
        type: Date
    },
    googleID: {
        type: String
    }
});

//associo la collezione di utenti al modello appena creato e lo esporto
const UserCollection = mongoose.model('userCollections', schema);

module.exports = UserCollection;