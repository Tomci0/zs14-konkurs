const Consultation = require('../../../models/Consultation');
const Registration = require('../../../models/Registration');

module.exports = (router) => {
    router.get('/consultations', (req, res) => {
        res.json({
            "methods": [
                {
                    "method": "POST",
                    "url": "/consultations/add",
                    "description": "Add new consultation",
                    "data": {
                        "subject": "String",
                        "hours": "String",
                        "building": "String",
                        "classroom": "String",
                        "date": "String"
                    },
                    "response": {
                        "status": "String",
                        "message": "String"
                    }
                },
                {
                    "method": "GET",
                    "url": "/consultations/get",
                    "description": "Get consultations",
                    "data": {
                        "date": {
                            "info": "Optional",
                            "year": "Number",
                            "month": "Number"
                        }
                    },
                    "response": {
                        "status": "String",
                        "message": "String",
                        "withRegistration": "Boolean",
                        "consultations": [
                            {
                                "_id": "String",
                                "subject": "String",
                                "hours": "String",
                                "building": "String",
                                "classroom": "String",
                                "date": "String",
                                "creator": {
                                    "name": "String"
                                },
                                "registered": "Boolean"
                            }
                        ]
                    }
                },
                {
                    "method": "POST",
                    "url": "/consultations/changeRegistration",
                    "description": "Change registration status",
                    "data": {
                        "consultation": "String"
                    },
                    "response": {
                        "status": "String",
                        "message": "String"
                    }
                },
                {
                    "method": "POST",
                    "url": "/consultations/edit",
                    "description": "Edit consultation",
                    "data": {
                        "consultation": "String",
                        "subject": "String",
                        "hours": "String",
                        "building": "String",
                        "classroom": "String",
                        "date": "String",
                        "maxMembers": "Number",
                        "description": "String"
                    },
                    "response": {
                        "status": "String",
                        "message": "String",
                    }
                }
            ]
        })
    });

    /*
    *
    * POST /consultations/add
    * Adding new consultation
    * 
    */

    router.post('/consultations/add', async (req, res) => {
        if (!req.user) {
            return res.status(500).json({
                "status": "error",
                "message": "You are not logged in!"
            })
        }
        if (req.user.role == 0) {
            return res.status(500).json({
                "status": "error",
                "message": "You are not allowed to do this!"
            })
        }

        const data = req.body;

        if (!data.subject || !data.hours || !data.building || !data.classroom || !data.date) {
            return res.status(500).json({
                "status": "error",
                "message": "Missing data!"
            })
        }

        try {
            const newConsultation = new Consultation({
                subject: data.subject,
                hours: data.hours,
                building: data.building,
                classroom: data.classroom,
                date: new Date(data.date).setHours(12, 0, 0, 0),
                creator: req.user._id,
                maxMembers: data.maxMembers,
                description: data.description
            });
    
            await newConsultation.save();

            return res.status(200).json({
                "status": "ok",
                "message": "Consultation saved!"
            });
        } catch(e) {
            return res.status(500).json({
                "status": "error",
                "message": "Error while saving consultation!"
            });
        }
    });

    /*
    *
    * GET /consultations/get
    * Getting consultations
    * 
    */

    router.get('/consultations/get', async (req, res) => {
        const data = req.query;
        try {
            let query = {
                date: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1, 2, 0, 0, 0),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)
                }
            };

            if (data.year && data.month) {
                query = {
                    date: {
                        $gte: new Date(data.year, Number(data.month), 1, 2, 0, 0, 0),
                        $lt: new Date(data.year, Number(data.month) + 1, 0, 23, 59, 59, 999)
                    }
                };
            }

            data.membersList = data.membersList == 'true'
            if (data.membersList && req.user && !req.user.isTeacher) data.membersList = false;
            
            let consultations = await Consultation.find(query).populate('creator', 'name')
            const registrations = await Registration.find({
                consultation: {
                    $in: consultations.map(consultation => consultation._id)
                },
            }).populate('user', 'name');
            
            if (data.withRegistration && req.user) {

                consultations = consultations.map(consultation => {
                    const members = registrations.filter(registration => registration.consultation._id.toString() == consultation._id.toString())
                    const registration = registrations.find(registration => registration.consultation.toString() == consultation._id.toString() && req.user._id.toString() == registration.user._id.toString());
                    return {
                        _id: consultation._id,
                        subject: consultation.subject,
                        hours: consultation.hours,
                        building: consultation.building,
                        classroom: consultation.classroom,
                        date: consultation.date,
                        creator: consultation.creator,
                        registered: registration ? true : false,
                        maxMembers: consultation.maxMembers,
                        members: data.membersList ? members.map(member => member.user.name) : members.length,
                        description: consultation.description
                    };
                });
            } else {
                consultations = consultations.map(consultation => {
                    const members = registrations.filter(registration => registration.consultation._id.toString() == consultation._id.toString())
                    return {
                        _id: consultation._id,
                        subject: consultation.subject,
                        hours: consultation.hours,
                        building: consultation.building,
                        classroom: consultation.classroom,
                        date: consultation.date,
                        creator: consultation.creator,
                        maxMembers: consultation.maxMembers,
                        members: data.membersList ? members.map(member => member.user.name) : members.length,
                        description: consultation.description
                    };
                });
            }

            // sort with hour

            consultations = consultations.sort((a, b) => {
                return a.hours - b.hours;
            });

            return res.status(200).json({
                "status": "ok",
                "message": "Consultations fetched!",
                "consultations": consultations
            });
        } catch(e) {
            console.log(e);
            return res.status(500).json({
                "status": "error",
                "message": "Error while fetching consultations!"
            });
        }
    });

    /*
    *
    * POST /consultations/changeRegistration
    * Changing registration status
    *
    */

    router.post('/consultations/changeRegistration', async (req, res) => {
        if (!req.user) {
            return res.status(500).json({
                "status": "error",
                "message": "You are not logged in!"
            })
        }

        const data = req.body;

        if (!data.consultation) {
            return res.status(500).json({
                "status": "error",
                "message": "Missing data!"
            })
        }

        try {
            const consultation = await Consultation.findById(data.consultation);

            if (!consultation) {
                return res.status(500).json({
                    "status": "error",
                    "message": "Consultation not found!"
                });
            }

            const registration = await Registration.findOne({
                consultation: consultation._id,
                user: req.user._id
            });

            if (registration) {
                await Registration.deleteOne({
                    consultation: consultation._id,
                });
            } else {
                const newRegistration = new Registration({
                    consultation: consultation._id,
                    user: req.user._id
                });

                await newRegistration.save();
            }

            return res.status(200).json({
                "status": "ok",
                "message": "Registration changed!",
                "registered": registration ? false : true
            });
        } catch(e) {
            console.log(e);
            return res.status(500).json({
                "status": "error",
                "message": "Error while changing registration!"
            });
        }
    });

    router.post('/consultations/edit', async (req, res) => {
        const data = req.body;
        
        try {
            let consultation = await Consultation.findOne( {
                _id: data.consultation
            });

            if (!consultation) {
                return res.status(500).json({
                    "status": "error",
                    "message": "Consultation not found!"
                });
            }

            await Consultation.updateOne({ _id: data.consultation }, { $set: {
                subject: data.subject,
                hours: data.hours,
                building: data.building,
                classroom: data.classroom,
                date: new Date(data.date).setHours(12, 0, 0, 0),
                maxMembers: data.maxMembers,
                description: data.description
            }});

            return res.status(200).json({
                "status": "ok",
                "message": "Consultation saved!",
            });
        } catch(e) {
            console.log(e);
            return res.status(500).json({
                "status": "error",
                "message": "Error while fetching consultations!"
            });
        }
    })

    router.delete('/consultations/delete', async (req, res) => {
        const data = req.body;

        try {
            let consultation = await Consultation.findOne( {
                _id: data.consultation
            });

            if (!consultation) {
                return res.status(500).json({
                    "status": "error",
                    "message": "Consultation not found!"
                });
            }

            await Consultation.deleteOne({ _id: data.consultation });
            await Registration.deleteMany({ consultation: data.consultation });

            return res.status(200).json({
                "status": "ok",
                "message": "Consultation deleted!",
            });
        } catch(e) {
            console.log(e);
            return res.status(500).json({
                "status": "error",
                "message": "Error while fetching consultations!"
            });
        }
    });
};