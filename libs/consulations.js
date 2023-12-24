const Registration = require('../models/Registration');

async function getMyConsultations(userId) {
    let consultations = await Registration.find({
        user: userId
    }).populate({
        path: 'consultation',
        populate: {
            path: 'creator',
            select: 'name'
        }
    });

    consultations = consultations.map(consultation => {
        return {
            _id: consultation.consultation._id,
            subject: consultation.consultation.subject,
            hours: hourIndexToString(consultation.consultation.hours),
            building: buildingIndexToString(consultation.consultation.building),
            classroom: consultation.consultation.classroom,
            date: new Date(consultation.consultation.date).toLocaleDateString(),
            teacher: consultation.consultation.creator.name,
        };
    });

    return consultations;
}

function hourIndexToString(data) {
    switch(data) {
        case '0':
            return '(0) 7:10 - 7:55';
        case '1':
            return '(1) 8:00 - 8:45';
        case '2':
            return '(2) 8:50 - 9:35';
        case '3':
            return '(3) 9:40 - 10:25';
        case '4':
            return '(4) 10:35 - 11:20';
        case '5':
            return '(5) 11:30 - 12:15';
        case '6':
            return '(6) 12:35 - 13:20';
        case '7':
            return '(7) 13:35 - 14:20';
        case '8':
            return '(8) 14:25 - 15:10';
        case '9':
            return '(9) 15:15 - 16:00';
        case '10':
            return '(10) 16:05 - 16:50';
        default:
            return 'Błąd';
    }
}

function buildingIndexToString(data) {
    switch (data) {
        case '1':
            return 'ul. Szanajcy 5';
        case '2':
            return 'ul. Szanajcy 17/19';
        default:
            return 'Błąd';
    }

}

module.exports = {
    getMyConsultations
}