//middleware di controllo autenticazione da passare alle rotte che necessitano di protezione
module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        // se l' utente è autenticato passo alla prossima middleware
        return next();
    }
    // altrimenti lo rimando alla pagina di login
    res.redirect('/auth/login');
}