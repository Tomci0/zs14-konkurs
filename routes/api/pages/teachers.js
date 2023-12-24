const User = require('../../../models/User');

module.exports = (router) => {
    router.get('/teachers', (req, res) => {
        res.json([
            {
                method: 'GET',
                path: '/api/teachers/get',
                description: 'Returns all teachers.',
                response: [
                    {
                        _id: '5d7a514b5d2c12c7449be042',
                        name: 'Jan Kowalski',
                    }
                ]
            }
        ])
    });

    router.get('/teachers/get', (req, res) => {
        User.find({ role: 1 }).then((teachers) => {
            res.json({
                status: 'ok',
                teachers: teachers.map((teacher) => {
                    return {
                        _id: teacher._id,
                        name: teacher.name
                    }
                })
            });
        });
    })  
}