// funzione che permette di validare una password
function validatePassword(password) {
    let uppercaseControl = /[a-z]/,
        SymbolControl = /[$-/:-?{-~!"^_`\[\]]/,
        numberControl = /[0-9]/,
        uppercaseVerificato = uppercaseControl.exec(password),
        symbolVerificato = SymbolControl.exec(password),
        numberVerificato = numberControl.exec(password);
    return uppercaseVerificato === null || symbolVerificato === null || numberVerificato === null || password.length < 8 ?
        true :
        false;
}

// funzione che permette di validare una mail
function validateMail(mail) {
    let mailControl = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        mailVerificata = mailControl.exec(mail);
    return mailVerificata !== null ? false : true;
}

module.exports = {
    validatePassword,
    validateMail,
}