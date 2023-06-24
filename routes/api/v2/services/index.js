const express = require('express');
const router = express.Router();
const auth = require('../../../../middleware/auth');
const Users = require('../../../../models/Users');
const ServicesMaster = require('../../../../models/ServicesMaster');
const Services = require('../../../../models/Services');
const ErrorHandler = require('../../../../errors/ErrorHandler');

// @desc    Services
// @route   GET /api/services

router.get('/', auth.verifyToken, async (req, res) => {

    const { id } = req.user;
    try {
        const user = await Users.findById(id);
        if (user) {
            await ServicesMaster.findOne({ userId: id }).then(serviceMaster => {
                serviceMaster.populate({
                    path: 'services',
                }).then(services => {
                    const { _id, ...rest } = services.toObject()
                    return res.status(200).json({
                        message: `Service Names for ${user.name}`,
                        data: rest
                    })
                })
            })
        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }


})

// @desc    Add Services
// @route   POST /api/services/add

router.post("/add", auth.verifyToken, async (req, res) => {
    const { id } = req.user

    try {
        const user = await Users.findById(id);
        if (user) {
            await ServicesMaster.findOneAndUpdate({ userId: id }, {}, { upsert: true, new: true }).then(async _ => {
                const servicesObject = req.body
                await Promise.all(Object.keys(servicesObject).map(async serviceKey => {
                    const serviceName = servicesObject[serviceKey];
                    await Services.findOne({ name: serviceName }).then(async service => {
                        if (!service) {
                            await ServicesMaster.findOneAndUpdate({ userId: id }, { $addToSet: { custom_services: serviceName } }, { new: true })
                        }
                        else {
                            await ServicesMaster.findOneAndUpdate({ userId: id }, { $addToSet: { services: service._id } }, { new: true })
                        }
                    })
                    return serviceKey
                })).then(async _ => {
                    await ServicesMaster.findOne({ userId: id }).then(serviceMaster => {
                        serviceMaster.populate({
                            path: 'services',
                        }).then(services => {
                            const { _id, ...rest } = services.toObject()
                            return res.status(200).json({
                                message: `Added services for ${user.name}`,
                                data: rest
                            })
                        })
                    })
                })

            }).catch(_ => {
                return res.status(400).json({
                    message: 'Error adding services'
                })
            })
        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }
})

// @desc    Services List (only admin use)
// @route   GET /api/services/list

router.get('/list', auth.verifyToken, async (req, res) => {

    const { id } = req.user;
    try {
        const user = await Users.findById(id);
        if (user) {
            await Services.find({}).then(services => {
                console.log(services)
                return res.status(200).json({
                    message: `Services Name List for ${user.name}`,
                    data: services
                })
            })
        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }


})


// @desc    Add Service Names (only for admin use)
// @route   POST /api/services/addservice

router.post("/addservice", [auth.verifyToken], async (req, res) => {
    const { id } = req.user
    try {
        const user = await Users.findById(id);
        if (user) {
            const servicesObject = req.body
            await Promise.all(Object.keys(servicesObject).map(async serviceKey => {
                const serviceName = servicesObject[serviceKey];
                return Services.findOneAndUpdate({ name: serviceName }, {}, { upsert: true, new: true })
            })).then(async _ => {
                return res.status(200).json({
                    message: `Added names to the services list`,
                    data: _
                })
            })
        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }
})

// @desc    Update Service by ID (only admin use)
// @route   PUT /api/services/update?id=

router.put("/update", auth.verifyToken, async (req, res) => {
    const { id } = req.query;
    const { name } = req.body;

    if (!name) return res.status(404).json({ message: 'Please provide new name' })
    try {
        const user = await Users.findById(req.user.id);
        if (user) {
            await Services.findOneAndUpdate({ _id: id }, { name }, { new: true }).then(service => {

                // const { skillMasterId, createdAt, updatedAt, ...skillInfo } = info.toObject()
                return res.status(200).json({
                    message: `Updated Service Name for ${user.name}`,
                    data: service.toObject()
                })
            }).catch(_ => {
                return res.status(403).json({
                    message: 'Error updating service name'
                })
            })
        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }
})

// @desc    Delete Service by Name or ID
// @route   DELETE /api/skills/delete?id=
//          DELETE /api/skills/delete?name=

router.delete("/delete", auth.verifyToken, async (req, res) => {
    const { id, name } = req.query;
    if (!id && !name) return res.status(404).json({
        message: 'Please enter valid name or id'
    })

    try {
        const user = await Users.findById(req.user?.id);
        const fn = async (string, boolean = true) => {
            await ServicesMaster.findOneAndUpdate({
                $and: [{ userId: user._id }, boolean ? {
                    services: {
                        "$in": [string]
                    }
                } : {
                    custom_services: {
                        "$in": [string]
                    }
                }]
            }, { $pull: boolean ? { services: string } : { custom_services: string } }, { new: true }).then(async newService => {
                await newService.populate({
                    path: 'services',
                    select: { name: 1, type: 1 },
                }).then(info => {
                    const { _id, ...rest } = info.toObject()
                    return res.status(200).json({
                        message: `Updated services for ${user.name}`,
                        data: { ...rest }
                    })
                })

            }).catch(_=>{
                return res.status(404).json({
                    message: `Service${boolean ? '' : ` name - ${string}`} not found`
                })
            })
        }
        if (user._id) {
            if (id) {
                await fn(id)
            }
            else if (name) {
                await fn(name, false)
            }
        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }
    return;
})



module.exports = router;