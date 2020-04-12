var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ===================================================================
//	           Obtener todos los hospitales                                                    
// ===================================================================


app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });


        });
});

// ===================================================================
//	           Crear un nuevo hospital                                                    
// ===================================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    })

});

// ===================================================================
//	           Actualizar un hospital                                                    
// ===================================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospitalBuscado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospitalBuscado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El hospital con el id' + id + "no existe",
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }

        hospitalBuscado.nombre = body.nombre;
        hospitalBuscado.usuario = req.usuario._id;

        hospitalBuscado.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al actualizar hospital'
                });
            }

            res.status(200).json({
                ok: true,
                usuario: hospitalGuardado
            })
        });
    });
});

// ===================================================================
//	           Borrar un hospital por el id                                                    
// ===================================================================

app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital a borrar no existe',
                errors: {
                    message: 'El hospital a borrar no existe'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    });
});

module.exports = app;