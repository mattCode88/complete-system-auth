const inputArray = document.querySelectorAll('.form-control'),
    countInputValidity = inputArray.length,
    title = document.getElementById('title').textContent,
    errors = document.querySelectorAll('.mt-error'),
    buttonSubmit = document.getElementById('button-submit');

// se siamo nella login o nella register prendo dal dom i relativi input
if (title === 'login' || title === 'register') {

    const usernameInput = document.getElementById('username'),
        passwordInput = document.getElementById('password');

    // aggiungo evento input all' input username
    usernameInput.addEventListener('input', e => {

        // se siamo nella pagina di register
        if (title === 'register') {

            // verifico che l' username sia maggiore di 2 lettere, se non lo è invalido l' input e mostro l' errore
            if (usernameInput.value.length < 3) {
                changeValidityForm('invalid', usernameInput);
                changeVisibilityError(true, errors[0]);

                // trigghero prepareToSubmit *
                prepareToSubmit()
            } else {

                // se lo username è maggiore di 2 lettere nascondo l' errore e trigghero la verifica con le api tramite verifyInput
                changeVisibilityError(false, errors[0]);
                verifyInput(usernameInput, 'verify-user?username', 0, 1);
            }
        }

        // se siamo nella pagina di login verifico unicamente che lo username sia maggiore di 2 lettere
        if (title === 'login') {
            if (usernameInput.value.length < 3) {
                changeValidityForm('invalid', usernameInput);
                changeVisibilityError(true, errors[0]);
                prepareToSubmit()
            } else {
                changeValidityForm('valid', usernameInput);
                changeVisibilityError(false, errors[0]);
                prepareToSubmit()
            }
        }

    })

    // aggiungo evento input all' input password
    passwordInput.addEventListener('input', e => {

        // in base alla pagina in cui mi trovo definisco un index per l' array dei contenitori di errori
        const error = title === 'register' ? 4 : 1;

        // controllo la validità della password inserita e gestisco validità dell' input e gli errori da mostrare
        if (validatePassword(passwordInput.value)) {
            changeValidityForm('invalid', passwordInput);
            changeVisibilityError(true, errors[error]);
            prepareToSubmit()
        } else {
            changeValidityForm('valid', passwordInput);
            changeVisibilityError(false, errors[error]);
            prepareToSubmit()
        }

    })

}

// se siamo nella password o nella register prendo dal dom i relativi input
if (title === 'password' || title === 'register') {

    const emailInput = document.getElementById('email');

    // aggiungo evento input all' input email
    emailInput.addEventListener('input', e => {

        // se siamo nella pagina di register 
        if (title === 'register') {

            // verifico la validità della mail inserità e se non lo è ritorno gli errori
            if (validateMail(emailInput.value)) {
                changeValidityForm('invalid', emailInput);
                changeVisibilityError(true, errors[2]);
                prepareToSubmit()
            } else {

                // se la mail è valida la verifico tramite api
                changeVisibilityError(false, errors[2]);
                verifyInput(emailInput, 'verify-email?email', 2, 3);
            }
        }

        // se siamo nella pagina di recovery password
        if (title === 'password') {

            //verifico la validità della mail inserita e gestisco gli errori
            if (validateMail(emailInput.value)) {
                changeValidityForm('invalid', emailInput);
                changeVisibilityError(true, errors[0]);
                prepareToSubmit()
            } else {
                changeValidityForm('valid', emailInput);
                changeVisibilityError(false, errors[0]);
                prepareToSubmit()
            }
        }

    })

}

// se siamo nella pagina di reset della password prendo i relativi input dal DOM
if (title === 'password-reset') {

    const resetPasswordInput1 = document.getElementById('password-reset1'),
        resetPasswordInput2 = document.getElementById('password-reset2');

    // aggiungo l' evento input alla prima password
    resetPasswordInput1.addEventListener('input', () => {

        // // se la seconda password è già stata inserita e il valore della prima e della seconda non corrispondono ritorno gli errori
        if (resetPasswordInput2.value.length > 0 && resetPasswordInput2.value !== resetPasswordInput1.value) {
            changeValidityForm('invalid', resetPasswordInput2);
            changeVisibilityError(true, errors[1]);
            prepareToSubmit()
        }

        // se la seconda è gia stata inserita e i due valori corrispondono rimuovo gli errori
        if (resetPasswordInput2.value.length > 0 && resetPasswordInput2.value === resetPasswordInput1.value) {
            changeValidityForm('valid', resetPasswordInput2);
            changeVisibilityError(false, errors[1]);
            prepareToSubmit()
        }

        // se la prima password non è valida, setto gli errori e blocco l' input della seconda
        if (validatePassword(resetPasswordInput1.value)) {
            changeValidityForm('invalid', resetPasswordInput1);
            changeVisibilityError(true, errors[0]);
            resetPasswordInput2.setAttribute('readonly', true);
            prepareToSubmit()
        } else {

            // altrimenti rimuovo gli errori e sblocco la seconda
            changeValidityForm('valid', resetPasswordInput1);
            changeVisibilityError(false, errors[0]);
            resetPasswordInput2.removeAttribute('readonly');
            prepareToSubmit()
        }

    })

    // aggiungo l' evento input alla seconda password
    resetPasswordInput2.addEventListener('input', () => {

        // se il valore inserito non corrisponde a quello della prima password setto gli errori
        if (resetPasswordInput2.value !== resetPasswordInput1.value) {
            changeValidityForm('invalid', resetPasswordInput2);
            changeVisibilityError(true, errors[1]);
            prepareToSubmit()
        } else {

            // altrimenti rimuovo gli errori
            changeValidityForm('valid', resetPasswordInput2);
            changeVisibilityError(false, errors[1]);
            prepareToSubmit()
        }

    })

}

// funzione che controlla la validità della password
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

// funzione che controlla la validità della email
function validateMail(mail) {
    let mailControl = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        mailVerificata = mailControl.exec(mail);
    return mailVerificata !== null ? false : true;
}

// vunzione che mette le classi is-valid e is-invalid all' input passato a seconda della validity passata
function changeValidityForm(validity, el) {
    if (validity === 'invalid') {
        el.classList.add('is-invalid')
        el.classList.remove('is-valid')
    } else {
        el.classList.add('is-valid')
        el.classList.remove('is-invalid')
    }
}

// funzione che nasconde o mostra gli i div.error passati a seconda del isError passato
function changeVisibilityError(isError, error) {
    if (isError) {
        error.classList.add('d-block');
        error.classList.remove('d-none');
    } else {
        error.classList.add('d-none');
        error.classList.remove('d-block');
    }
}

// funzione che verifica gli input passati
function verifyInput(typeInput, searchQuery, err) {

    // richesta get alle api definite nel controller auth-controller (verifyUsername, verifyEmail)
    fetch(`http://localhost:3000/api/${searchQuery}=${typeInput.value}`)
        .then(risp => {
            return risp.text()
        }).then(ris => {
            const dati = JSON.parse(ris);

            // se ritorna un utente, invalido l' input e mostro l' errore
            if (dati.username) {
                changeValidityForm('invalid', typeInput);
                changeVisibilityError(true, errors[err]);
            } else {

                // altrimenti rimuovo l' errore e valido l' input
                changeValidityForm('valid', typeInput);
                changeVisibilityError(false, errors[err]);
            }
            prepareToSubmit();
        })

}

// questa funzione verifica che tutti gli input presenti in pagina siano validi, se si abilita il bottone di submit
function prepareToSubmit() {

    let count = 0;

    // ciclo tutti gli input presenti in pagina e per ogni input valido aggiungo 1 a count
    inputArray.forEach(formEl => {
        if (formEl.classList.contains('is-valid')) {
            count++
        };
    })

    // se count sarà uguale al numero di input vuol dire che tutto è corretto, a questo punto bilito il bottone
    if (count === countInputValidity) {
        buttonSubmit.disabled = false;
    } else {

        // altrimenti disabilito il bottone
        buttonSubmit.disabled = true;
    }

}