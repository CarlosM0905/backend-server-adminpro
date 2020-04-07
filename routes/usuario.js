var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// ===================================================================
//	           Obtener todos los usuarios                                                   
// ===================================================================

app.get('/', (req, res, next) => {

    Usuario.find({},'nombre email img role').exec(
        (err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuarios: usuarios
        })
    })


})




// ===================================================================
//	           Crear un nuevo usuario                                                    
// ===================================================================

app.post('/', mdAutenticacion.verificaToken, (req, res)=>{
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryptjs.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    })

    usuario.save((err, usuarioGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crar usuario',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken : req.usuario
        })
    })
});

// ===================================================================
//	           Actualizar un usuario                                                    
// ===================================================================

app.put('/:id',mdAutenticacion.verificaToken, (req,res)=>{

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuarioBuscado)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                errors: err
            });
        }

        if(!usuarioBuscado){
            return res.status(404).json({
                ok: false,
                mensaje: 'El usuario con el id '+ id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }

        usuarioBuscado.nombre = body.nombre;
        usuarioBuscado.email = body.email;
        usuarioBuscado.role = body.role;

        usuarioBuscado.save((err,usuarioGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                })
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });


});

// ===================================================================
//	           Borrar un usuario por el id                                                    
// ===================================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res)=>{
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
        if(err){
            return res.json(500).json({
                ok: false,
                message: 'Error al borrar usuario',
                errors: err
            })
        }

        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                message: 'El usuario a borrar no existe',
                errors: {message:'El usuario a borrar no existe' }
            })
        }


        res.status(200).json({
           ok: true,
           usuario: usuarioBorrado 
        })
    })
})

module.exports = app;