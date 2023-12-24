$(() => {
    // GET SITE URL

    var url = window.location.href;
    var page = url.split('/')[3];
    $(`[data-page='${page==''?'index':page}']`).addClass('active');

    $('.google-login-btn').click(() => {
        window.location.href = '/auth';
    });
});