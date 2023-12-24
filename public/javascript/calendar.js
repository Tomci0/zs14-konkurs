function getDaysTable(year, month) {
    var daysTable = [];
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);

    for (var i = 0; i < 41; i++) {
        daysTable.push(false);
    }

    var firstDayIndex = firstDay.getDay() - 1;
    var lastDayIndex = lastDay.getDay() - 1;

    if (firstDayIndex == -1) {
        firstDayIndex = 6;
    }

    if (lastDayIndex == -1) {
        lastDayIndex = 6;
    }

    for (var i = 0; i < lastDay.getDate(); i++) {
        daysTable[firstDayIndex + i] = i + 1;
    }

    let weeks = []
    for (var i = 0; i < daysTable.length; i++) {
        if (!weeks[Math.floor(i / 7)]) {
            if (daysTable[i] == false && i > 7) continue;
            weeks[Math.floor(i / 7)] = [];
        }

        weeks[Math.floor(i / 7)].push(daysTable[i]);
    }


    return weeks;
}

const months = [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Pażdziernik',
    'Listopad',
    'Grudzień'
]

let currentData = {}

function setCalendar(year, month) {
    if (year == undefined) { 
        year = new Date().getFullYear();
    }  

    if (month == undefined) {
        month = new Date().getMonth();
    }

    currentData.year = year;
    currentData.month = month;
    $('#calendar').attr('data-month', month);
    $('#calendar').attr('data-year', year);

    $('.month-selection .month').text(months[month]);
    $('.month-selection .year').text(year);

    const currentCalendarArray = getDaysTable(year, month);
    $('#calendar tbody').html('');
    for (var i = 0; i < currentCalendarArray.length; i++) {
        var week = currentCalendarArray[i];
        var weekRow = document.createElement('tr');
    
        for (var j = 0; j < week.length; j++) {
            var day = week[j];
            var dayCell = document.createElement('td');
            if (day) {
                dayCell.setAttribute('date-day', day);
                dayCell.innerHTML = `
                <div class="day-month">
                    <div class="day ${year == new Date().getFullYear() & month == new Date().getMonth() & day == new Date().getDate()?'active':''}">
                        <span>${day}</span>
                    </div>
                </div>
                <div class="plate-list">
    
                </div>
                `;
            } else {
                dayCell.innerHTML = ''
            }
            
            weekRow.appendChild(dayCell);
        }

       $('#calendar tbody').append(weekRow) 
    }

    refreshCalendarContent();
}

setCalendar();

(async () => {
    const teachers = await $.ajax({
        url: '/api/teachers/get',
        method: 'GET'
    });

    if (teachers.status == 'ok') {
        teachers.teachers.forEach((teacher) => {
            $('#teachers-filter').append(`<option value="${teacher._id}">${teacher.name}</option>`);
        });
    }
})()

$('#teachers-filter').on('change', filterConsultations);

function filterConsultations() {
    const teacherId = $('#teachers-filter').val();
    if (teacherId == 'all') {
        $('[data-consultation-index]').each((index, element) => {
            $(element).show();
        });
    } else {
        $('[data-consultation-index]').each((index, element) => {
            $(element).hide();
        });

        $('[data-consultation-index]').each((index, element) => {
            if (getConsultation($(element).attr('data-consultation-index')).creator._id == teacherId) {
                $(element).show();
            }
        });
    }
}

$(() => {
    $(".month-selection .prev").click(() => {
        var currentMonth = $('#calendar').attr('data-month');
        var currentYear = $('#calendar').attr('data-year');
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        $('.month-selection .prev').attr('disabled', true);
        setCalendar(currentYear, currentMonth);
    });

    $(".month-selection .next").click(() => {
        var currentMonth = $('#calendar').attr('data-month');
        var currentYear = $('#calendar').attr('data-year');
        currentMonth++;

        if (currentMonth > 11) {
            currentYear++;
            currentMonth = 0;
        }

        $('.month-selection .next').attr('disabled', true);
        setCalendar(currentYear, currentMonth);
    });
});

let consultations = [];

async function refreshCalendarContent() {
    $('[data-consultation-index]').each((index, element) => {
        $(element).unbind('click');
    });
    $('#calendar .plate-list').html('');
    const url = window.location.href.split('/')[3]
    const data = await $.ajax({
        url: '/api/consultations/get',
        method: 'GET',
        data: {
            membersList: url=='panel'?true:false,
            withRegistration: url=='panel'?false:true,
            year: currentData.year,
            month: currentData.month
        }
    });

    if (data.status == 'ok') {
        consultations = data.consultations;
        $('.month-selection .prev').attr('disabled', false);
        $('.month-selection .next').attr('disabled', false);
        data.consultations.forEach((consultation, index) => {
            $('[date-day="' + new Date(consultation.date).getDate() + '"] .plate-list').append(`
                <div class="plate ${randomColor()}" data-consultation-index="${index}">
                    <span class="time">${hourIndexToString(consultation.hours)}</span>
                    <span class="value">${consultation.subject}<br/>${consultation.creator.name}</span>
                </div>
            `);

            $(`[data-consultation-index="${index}"]`).on('click', function() {
                $('#consultation-previewModal #subject').text(consultation.subject);
                $('#consultation-previewModal #teacher-name').text(consultation.creator.name);
                $('#consultation-previewModal #hours').text(hourIndexToString(consultation.hours));
                $('#consultation-previewModal #building').text(buildingIndexToString(consultation.building));
                $('#consultation-previewModal #classroom').text(consultation.classroom);
                $('#consultation-previewModal #date').text(new Date(consultation.date).toLocaleString());
                $('#consultation-previewModal #members-count').text((typeof consultation.members == 'object'?consultation.members.length:consultation.members) + '/' + consultation.maxMembers);
                $('#consultation-previewModal #description').html(consultation.description || 'Brak opisu');
                
                if (url != "panel") {
                    if (consultation.registered) {
                        $('#register-for-consultation-btn').show();
                        $("#register-for-consultation-btn").removeClass('btn-success').addClass('btn-danger').text('Wypisz się');
                    } else if (consultation.registered == false && consultation.members < consultation.maxMembers) {
                        $('#register-for-consultation-btn').show();
                        $("#register-for-consultation-btn").removeClass('btn-danger').addClass('btn-success').text('Zapisz się');
                    } else {
                        $("#register-for-consultation-btn").hide();
                    }
                
                    $('#consultation-previewModal').modal('show');

                    $('#register-for-consultation-btn').on('click', () => {
                        $('#register-for-consultation-btn').html(`
                            <div class="spinner-border spinner-border-sm" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        `).attr('disabled', true);
                        $.ajax({
                            url: '/api/consultations/changeRegistration',
                            method: 'POST',
                            data: {
                                consultation: consultation._id
                            },
                            success: async (data) => {
                                if (data.status == 'ok') {
                                    if (data.registered) {
                                        consultation.members++;
                                        consultation.registered = true;
                                        addConsultationForMember(consultation);
                                        $("#register-for-consultation-btn").removeClass('btn-success').addClass('btn-danger').text('Wypisz się').attr('disabled', false);
                                    } else {
                                        consultation.members--;
                                        consultation.registered = false;
                                        $('#my-consultations #my-consultations-list .consultation-item[data-consulation-id="' + consultation._id + '"]').remove();
                                        $("#register-for-consultation-btn").removeClass('btn-danger').addClass('btn-success').text('Zapisz się').attr('disabled', false);
                                    }
                                    $('#consultation-previewModal #members-count').text(consultation.members.length || consultation.members + '/' + consultation.maxMembers);
                                } else {
                                    console.log(data)
                                }
                            },
                            error: (err) => {
                                console.log(err)
                            }
                        })
                    });
                } else {

                    if (consultation.creator._id != userId) {
                        $('#consultation-previewModal [data-bs-target="#consultation-editModal"]').hide();
                        $('#consultation-previewModal #delete-consultation-btn').hide();
                        $('#consultation-previewModal [data-bs-target="#consultation-enrolled-studentsModal"]').hide();
                    } else {
                        $('#consultation-previewModal #delete-consultation-btn').show();
                        $('#consultation-previewModal [data-bs-target="#consultation-editModal"]').show();

                        if (consultation.members.length == 0) {
                            $('#consultation-previewModal [data-bs-target="#consultation-enrolled-studentsModal"]').hide();
                        } else {
                            $('#consultation-previewModal [data-bs-target="#consultation-enrolled-studentsModal"]').show();
                        }
                    }

                    $('#consultation-previewModal').modal('show');

                    $('#delete-consultation-btn').on('click', () => {
                        $('#delete-consultation-btn').html(`
                            <div class="spinner-border spinner-border-sm" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        `).attr('disabled', true);
                        $.ajax({
                            url: '/api/consultations/delete',
                            method: 'DELETE',
                            data: {
                                consultation: consultation._id
                            },
                            success: async (data) => {
                                if (data.status == 'ok') {
                                    $('#consultation-previewModal').modal('hide');
                                    if (new Date(consultation.date).getMonth() == currentData.month && new Date(consultation.date).getFullYear() == currentData.year) {
                                        refreshCalendarContent();
                                    }
                                    $('#delete-consultation-btn').html('Usuń').attr('disabled', false);
                                    Notify('Konsultacja została usunięta.', 'success')
                                } else {
                                    console.log(data)
                                }
                            },
                            error: (err) => {
                                console.log(err)
                            }
                        })
                    });

                    $('[data-bs-target="#consultation-editModal"]').on('click', () => {
                        $('#consultation-editModal #subject-inp').val(consultation.subject).addClass('is-valid').removeClass('is-invalid');
                        $('#consultation-editModal #hours-sel').val(consultation.hours).addClass('is-valid').removeClass('is-invalid');
                        $('#consultation-editModal #building-sel').val(consultation.building).addClass('is-valid').removeClass('is-invalid');
                        $('#consultation-editModal #classroom-inp').val(consultation.classroom).addClass('is-valid').removeClass('is-invalid');
                        $('#consultation-editModal #date-inp').val(new Date(consultation.date).toISOString().split('T')[0]).addClass('is-valid').removeClass('is-invalid');
                        $('#consultation-editModal #max-members-inp').val(consultation.maxMembers).addClass('is-valid').removeClass('is-invalid');
                        $('#consultation-editModal #description-inp').val(consultation.description || 'Brak Opisu');

                        $('#consultation-editModal #edit-btn').on('click', async () => {
                            const subjectInp = $('#consultation-editModal #subject-inp');
                            const hoursSel = $('#consultation-editModal #hours-sel');
                            const buildingSel = $('#consultation-editModal #building-sel');
                            const classroomInp = $('#consultation-editModal #classroom-inp');
                            const dateInp = $('#consultation-editModal #date-inp');
                            const maxMembersInp = $('#consultation-editModal #max-members-inp');
                            const descriptionInp = $('#consultation-editModal #description-inp');

                            if (!subjectInp.hasClass('is-valid') || !hoursSel.hasClass('is-valid') || !buildingSel.hasClass('is-valid') || !classroomInp.hasClass('is-valid') || !dateInp.hasClass('is-valid') || !maxMembersInp.hasClass('is-valid')) {
                                if (!subjectInp.hasClass('is-valid')) subjectInp.addClass('is-invalid')
                                if (!hoursSel.hasClass('is-valid')) hoursSel.addClass('is-invalid')
                                if (!buildingSel.hasClass('is-valid')) buildingSel.addClass('is-invalid')
                                if (!classroomInp.hasClass('is-valid')) classroomInp.addClass('is-invalid')
                                if (!dateInp.hasClass('is-valid')) dateInp.addClass('is-invalid')
                                if (!maxMembersInp.hasClass('is-valid')) maxMembersInp.addClass('is-invalid')
                                return Notify('Wypełnij wszystkie pola.', 'error'); 
                            }

                            $('#consultation-editModal #edit-btn').html(`
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            `).attr('disabled', true);

                            
                            $.ajax({
                                url: '/api/consultations/edit',
                                method: 'POST',
                                data: {
                                    consultation: consultation._id,
                                    subject: subjectInp.val(),
                                    hours: hoursSel.val(),
                                    building: buildingSel.val(),
                                    classroom: classroomInp.val(),
                                    date: new Date(dateInp.val()),
                                    maxMembers: maxMembersInp.val(),
                                    description: descriptionInp.val()
                                },
                                success: async (data) => {
                                    if (data.status == 'ok') {
                                        $('#consultation-editModal').modal('hide');
                                        if (new Date(dateInp.val()).getMonth() == currentData.month && new Date(dateInp.val()).getFullYear() == currentData.year) {
                                            refreshCalendarContent();
                                        }
                                        $('#consultation-editModal #edit-btn').html('Zapisz Zmiany').attr('disabled', false);
                                        Notify('Konsultacja została zaktualizowana.', 'success')
                                    } else {
                                        console.log(data)
                                    }
                                },
                                error: (err) => {
                                    console.log(err)
                                }
                            })
                        });
                    })

                    $('[data-bs-target="#consultation-enrolled-studentsModal"]').on('click', () => {
                        $('#consultation-enrolled-studentsModal #members-list').html('');
                        if (consultation.members.length == 0) {
                            $('#consultation-enrolled-studentsModal #members-list').append('<span class="text-center">Brak zapisanych uczniów</span>');
                            $('#generate-members-list-btn').hide();
                        } else {
                            $('#generate-members-list-btn').show();
                            consultation.members.forEach((student) => {
                                $('#consultation-enrolled-studentsModal #members-list').append(`<li>${student}</li>`);
                            });
                        }

                        $('#generate-members-list-btn').on('click', () => {
                            generateMemberPDF(consultation.members);
                        });
                    });
                }
            });
            filterConsultations();
        });
    }
}

$('#consultation-editModal').on('hidden.bs.modal', function () {
    $('#consultation-editModal #edit-btn').unbind('click');
});

$('#consultation-previewModal').on('hidden.bs.modal', function () {
    $('#register-for-consultation-btn').unbind('click');
    $('[data-bs-target="#consultation-editModal"]').unbind('click');
});

function getConsultation(index) {
    return consultations[index];
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

function randomColor() {
    const options = [
        'green',
        'yellow',
        'red',
        'blue',
        'purple',
        'turquoise',
        'orange',
        'pink',
        'brown',
    ]

    return options[Math.floor(Math.random() * options.length)];
}

function addConsultationForMember(data) {
    $('#my-consultations #my-consultations-list').append(`
    <div class="consultation-item" data-consulation-id="${data._id}">
        <button class="my-consultation-item bg-danger" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${data._id}" aria-expanded="false" aria-controls="collapse2">
            <div class="d-flex flex-column">
                <span>${escape(data.subject)}</span>
                <span>${hourIndexToString(data.hours)}<span>
            </div>
        </button>
        <div class="collapse" id="collapse${data._id}">
            <div class="card card-body">
                <div class="d-flex flex-column gap-2">
                    <div class="details-item">
                        <span class="title">Przedmiot:</span>
                        <span class="value">${escape(data.subject)}</span>
                    </div>
                    <div class="details-item">
                        <span class="title">Nauczyciel:</span>
                        <span class="value">${data.creator.name}</span>
                    </div>
                    <div class="details-item">
                        <span class="title">Godziny:</span>
                        <span class="value">${hourIndexToString(data.hours)}</span>
                    </div>
                    <div class="details-item">
                        <span class="title">Data:</span>
                        <span class="value">${data.date}</span>
                    </div>
                    <div class="details-item">
                        <span class="title">Budynek:</span>
                        <span class="value">${buildingIndexToString(data.building)}</span>
                    </div>
                    <div class="details-item">
                        <span class="title">Opis:</span>
                        <span class="value">${data.description || "Brak Opisu"}</span>
                    </div>
                    <div class="details-item">
                        <span class="title">Sala:</span>
                        <span class="value">${data.classroom}</span>
                    </div>
                    <button class="btn btn-danger unregister-btn" data-consulation-id="${data._id}" type="button">Wypisz się</button>
                </div>
            </div>
        </div>
    </div>
    `)
}

function escape(htmlStr) {
    return htmlStr.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");        
 
 }