const mongoose = require('mongoose');

// disabilita la modalità rigorosa (strict mode) di Mongoose per le query di database
mongoose.set("strictQuery", false);

// definisco la funzione connectDb asincrona
const connectDb = async (mongouri, port, app) => {
    try {

        // attendo la connessione al db con mongoose, lo mostro in console e metto il server in ascolto
        const connect = await mongoose.connect(mongouri);
        console.log(`MongoDB connected: ${connect.connection.host}`);
        app.listen(port, () => console.log(`Server in ascolto sula porta ${port}`));
    } catch (err) {

        // in caso di errori li notifico in console e chiudo il processo
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDb;