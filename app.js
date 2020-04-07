// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables

var app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Conexion a la base de datos
let BD_URL = `mongodb://localhost:27017/hospitalDB`;

mongoose.connection.openUri(BD_URL, (err, res)=>{
    if(err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m' ,'online');
});

//Rutas
app.use('/usuario',usuarioRoutes);
app.use('/login',loginRoutes);
app.use('/',appRoutes);

// Escuchar peticiones
app.listen(3000,()=>{
    console.log('Express server en el puerto 3000: \x1b[32m%s\x1b[0m' ,'online');
});