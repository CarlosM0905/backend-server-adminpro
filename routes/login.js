var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
const {
    OAuth2Client
} = require('google-auth-library');


var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID

var app = express();
const client = new OAuth2Client(CLIENT_ID);

var Usuario = require('../models/usuario');

// ===================================================================
//              Autenticacion de Google
// ===================================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
}

app.post('/google', async (req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });


    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticacion normal'
                });
            } else {
                var token = jwt.sign(
                    {usuario: usuarioDB},
                    SEED, {
                    expiresIn: 14400
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });
            }
        }
        else{
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save((err, usuarioDB)=>{
                var token = jwt.sign(
                    {usuario: usuarioDB},
                    SEED, {
                    expiresIn: 14400
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                })
            });
        }

    });

})


// ===================================================================
//	           Autenticacion normal                                                    
// ===================================================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            })
        }

        if (!bcryptjs.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            })
        }

        // Crear un token
        usuarioDB.password = ':)';

        var token = jwt.sign({
            usuario: usuarioDB
        }, SEED, {
            expiresIn: 14400
        });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token
        })
    });


})


module.exports = app;