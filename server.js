const express = require('express');
// const https = require('https');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const fs = require('fs');
const { ServiceProvider } = require('samlify');

const app = express();

// Configurazione della strategia SAML per SPID
passport.use(new SamlStrategy({
    entryPoint: 'https://demo.spid.gov.it/samlsso',
    issuer: 'https://example.com/spid',
    callbackUrl: 'https://b1cc-37-163-78-249.ngrok-free.app/saml/acs',

    cert: fs.readFileSync('./idp-cert.pem', 'utf-8'), // Certificato dell'IdP
}, (profile, done) => {
    console.log('profile : ',profile,'done : ', done)
    return done(null, profile);
}));

app.use(passport.initialize());

// Endpoint per avviare l'autenticazione SPID
app.get('/login', passport.authenticate('saml'));

// Endpoint per ricevere le risposte SAML
app.post('/saml/acs', passport.authenticate('saml', {
    failureRedirect: '/error',
}), (req, res) => {
    res.redirect(`http://localhost:4200/success?token=${req.user}`);
});
app.get('/', (req, res) => {
    res.send('Benvenuto al server SPID!');
});

// Endpoint per servire il metadata
app.get('/metadata', (req, res) => {
    const sp = ServiceProvider({
        entryPoint: 'https://demo.spid.gov.it/samlsso',
        issuer: 'https://example.com/spid',
        callbackUrl: 'https://tuo-dominio.ngrok-free.app/saml/acs',
        cert: fs.readFileSync('./sp-metadata.xml', 'utf-8'),
        signingCert: fs.readFileSync('./cert.pem', 'utf-8'), // Certificato pubblico
    });
    
    res.type('application/xml');
    res.send(sp.getMetadata());
});

// Avvia il server Express
app.listen(3000, '127.0.0.1',  () => {
    console.log('Server in esecuzione su http://localhost:3000');
});


app.get('/sp-metadata', (req, res) => {
    res.type('application/xml');
    res.send(metadata); // Oppure carica il contenuto dal file sp-metadata.xml
  });
  

const options = {
    key: fs.readFileSync('./key.pem'), // Percorso della chiave privata
    cert: fs.readFileSync('./sp-cert.pem'), // Percorso del certificato
};

// Definisci le route
app.get('/login', (req, res) => {
    res.send('Server HTTPS in esecuzione su login');
});



// Avvia il server HTTPS
// https.createServer(options, app).listen(3000, () => {
//     console.log('Server HTTPS in ascolto su https://localhost:3000');
// });