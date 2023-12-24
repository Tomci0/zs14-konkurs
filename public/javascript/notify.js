const notifyTypes = {
    success: (msg) => {
        return $(`
        <div class="notification success" style="top: -50px;">
            <span class="iconify icon" data-icon="material-symbols:check"></span>
            <span>${msg}</span>
        </div>
        `)
    },
    error: (msg) => {
        return $(`
        <div class="notification error" style="top: -50px;">
            <span class="iconify icon" data-icon="octicon:alert-16"></span>
            <span>${msg}</span>
        </div>
        `)
    },
    info: (msg) => {
        return $(`
        <div class="notification info" style="top: -50px;">
            <span class="iconify icon" data-icon="lucide:info"></span>
            <span>${msg}</span>
        </div>
        `)
    }
}

// NOTIFY

let currentNotify = null;

async function Notify(message, type) {
    if (currentNotify) return;
    currentNotify = notifyTypes[notifyTypes[type] && type || 'info'](message)

    currentNotify.animate({
        top: '8px'
    }, 200);

    currentNotify.appendTo('body');

    setTimeout(() => {
        currentNotify.animate({
            top: '-50px'
        }, 200, () => {
            currentNotify.remove();
            currentNotify = null;
        });
    }, 2000)
}