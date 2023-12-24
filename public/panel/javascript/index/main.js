$(() => {
    $('#consultation-createModal #hours-sel, #consultation-editModal #hours-sel').on('change', e => {
        const hoursSel = $(e.target)
        const hoursVal = hoursSel.val()

        if (hoursVal !== 'none') {
            hoursSel.addClass('is-valid').removeClass('is-invalid')
        } else {
            hoursSel.addClass('is-invalid').removeClass('is-valid')
        }
    });

    $('#consultation-createModal #building-sel, #consultation-editModal #building-sel').on('change', e => {
        const buildingSel = $(e.target)
        const buildingVal = buildingSel.val()

        if (buildingVal !== 'none') {
            buildingSel.addClass('is-valid').removeClass('is-invalid')
        } else {
            buildingSel.addClass('is-invalid').removeClass('is-valid')
        }
    });

    $('#consultation-createModal #max-members-inp, #consultation-editModal #max-members-inp').on('input propertychange paste', function () {
        const inp = $(this)

        if (Number(inp.val()) > 0) {
            inp.addClass('is-valid').removeClass('is-invalid')
        } else {
            inp.addClass('is-invalid').removeClass('is-valid')
        }
    });

    $('#consultation-createModal #classroom-inp, #consultation-createModal #subject-name-inp, #consultation-editModal #classroom-inp, #consultation-editModal #subject-name-inp').on('input propertychange paste', function () {
        const inp = $(this)

        if (inp.val().length > 0) {
            inp.addClass('is-valid').removeClass('is-invalid')
        } else {
            inp.addClass('is-invalid').removeClass('is-valid')
        }
    });

    $('#consultation-createModal #date-inp, #consultation-editModal #date-inp').on('input propertychange paste', function () {
        const dateInp = $(this)
        const dateVal = new Date(dateInp.val())
        if (dateVal == 'Invalid Date' || dateVal < new Date()) {
            dateInp.addClass('is-invalid').removeClass('is-valid')
        } else {
            dateInp.addClass('is-valid').removeClass('is-invalid')
        }
    });

    $("#consultation-createModal #create-btn").on('click', async () => {
        const subjectInp = $('#consultation-createModal #subject-name-inp')
        const hoursSel = $('#consultation-createModal #hours-sel')
        const buildingSel = $('#consultation-createModal #building-sel')
        const classroomInp = $('#consultation-createModal #classroom-inp')
        const dateInp = $('#consultation-createModal #date-inp')
        const maxMembersInp = $('#consultation-createModal #max-members-inp')
        const descriptionInp = $('#consultation-createModal #description-inp')

        if (!subjectInp.hasClass('is-valid') || !hoursSel.hasClass('is-valid') || !buildingSel.hasClass('is-valid') || !classroomInp.hasClass('is-valid') || !dateInp.hasClass('is-valid') || !maxMembersInp.hasClass('is-valid')) {
            if (!subjectInp.hasClass('is-valid')) subjectInp.addClass('is-invalid')
            if (!hoursSel.hasClass('is-valid')) hoursSel.addClass('is-invalid')
            if (!buildingSel.hasClass('is-valid')) buildingSel.addClass('is-invalid')
            if (!classroomInp.hasClass('is-valid')) classroomInp.addClass('is-invalid')
            if (!dateInp.hasClass('is-valid')) dateInp.addClass('is-invalid')
            if (!maxMembersInp.hasClass('is-valid')) maxMembersInp.addClass('is-invalid')
            Notify('Wypełnij wszystkie pola.', 'error')
            return
        }

        $.ajax({
            url: '/api/consultations/add',
            method: 'POST',
            data: {
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
                    $('#consultation-createModal').modal('hide')
                    $('#consultation-createModal #subject-name-inp').val('').removeClass('is-valid')
                    $('#consultation-createModal #hours-sel').val('none').removeClass('is-valid')
                    $('#consultation-createModal #building-sel').val('none').removeClass('is-valid')
                    $('#consultation-createModal #classroom-inp').val('').removeClass('is-valid')
                    $('#consultation-createModal #date-inp').val('').removeClass('is-valid')
                    $('#consultation-createModal #max-members-inp').val('').removeClass('is-valid')
                    $('#consultation-createModal #description-inp').val('')
                    refreshCalendarContent();
                    Notify('Pomyślnie dodano konsultacje.', 'success')
                    
                } else {
                    Notify(data.message, 'error')
                }
            },
            error: (err) => {
                Notify('Wystąpił nieznany błąd.', 'error')
                console.log(err)
            }
        })
    });

    // on modal close
})

function generateMemberPDF(members) {
    const table = document.createElement('table')
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '20px';
    table.style.color = '#000';
    table.classList.add('attendance-table'); // Dodaj unikalną klasę do tabeli

    const thead = document.createElement('thead')
    thead.innerHTML = `
        <tr>
            <th style="border: 1px solid #000;width:20px;padding-left: 5px">Lp.</th>
            <th colspan="2" style="border: 1px solid #000;padding-left: 10px">Imię i Nazwisko</th>
            <th style="border: 1px solid #000;width: 50px;padding-left: 10px"></th>
        </tr>
    `
    table.appendChild(thead)
    

    const tbody = document.createElement('tbody')
    let i = 0
    
    members.forEach(member => {
        const tr = document.createElement('tr')
        i++
        tr.innerHTML = `
            <td style="border: 1px solid #000;padding-left: 10px">${i}</td>
            <td colspan="2" style="border: 1px solid #000;padding-left: 10px">${member}</td>
            <td style="border: 1px solid #000;width: 50px;padding-left: 10px"></td>
        `
        tbody.appendChild(tr)
    })

    table.appendChild(tbody);

    var opt = {
        margin:       0.5,
        filename:     'obecnosc.pdf',
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(table).save('test.pdf');
}