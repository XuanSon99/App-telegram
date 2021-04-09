const moment = require('moment')
let list = db.get('accounts').value()
let option = ""

list.forEach(item => {
    option += `<option value="${item.id + ';' + item.user.username}">${item.user.username}</option>`
});

document.getElementById("select_account").innerHTML = option
document.getElementById("select_account").innerHTML = option

function $(id) {
    return document.querySelector(id)
}

function addScript() {
    let name = $("#script_name").value
    let group = $("#script_group").value
    if (!name || !group) {
        showAbout('error', 'Cảnh báo', 'Vui lòng nhập đủ thông tin!');
        return
    }

    db.get('scripts')
        .push({
            id: uuidv4(),
            script_name: name,
            group_id: group.split(";")[0],
            group_name: group.split(";")[1],
            details: [],
            created_at: new Date().toLocaleString()
        })
        .write()

    $("#script_name").value = ""
    $("#script_group").value = ""
    $("#error").innerHTML = ""
    showListScript()
    showAbout('info', 'Thành Công', 'Thêm Thành Công!');
}

function showListScript() {
    let List = db.get('scripts').value()
    let tbody = ""
    for (let i = 0; i < List.length; i++) {
        tbody += `<tr>
              <td>${i + 1}</td>
              <td>${List[i].script_name}</td>
              <td>${List[i].group_id}</td>
              <td>${List[i].group_name}</td>
              <td>${List[i].created_at}</td>
              <td>
              <button class="success" onclick="addDetail('${List[i].id}')" style="margin: 0 auto">Thêm</button>
              </td>
              <td style="display: flex; justify-content: center;">
              <button class="warning" onclick="detailScript('${List[i].id}')">Chi tiết</button>
              <button class="success" style="width: 70px" onclick="reRunScript('${List[i].id}')">Chạy lại</button>
              <button class="danger" onclick="removeScript('${List[i].id}')">Xóa</button>
              </td>
            </tr>`
    }
    $(".script-list tbody").innerHTML = tbody
}
showListScript()

let id_script = ""

function addDetail(id) {
    $(".popup-detail").style.display = "block"
    $(".cover").style.display = "block"
    id_script = id
}

function addDetailScript() {
    let account = $("#select_account").value
    let content = $("#script_content").value
    let time = $("#time_script").value

    if (!$("#script_content").value || !$("#time_script").value) {
        showAbout('error', 'Cảnh báo', 'Vui lòng nhập đủ thông tin!');
        return
    }

    let list = db.get('scripts').value()
    for (let i = 0; i < list.length; i++) {
        if (list[i].id == id_script) {
            db.get(`scripts[${i}].details`)
                .push({
                    account_id: account.split(";")[0],
                    account_name: account.split(";")[1],
                    datetime: time,
                    content: [content],
                    is_run: false,
                    id: uuidv4()
                })
                .write()
        }
    }
    $("#script_content").value = ""
    $("#time_script").value = ""
    showListScript()
    showAbout('info', 'Thành Công', 'Thêm Thành Công!');
}

function removeScript(id) {
    if (confirm("Chắc chắn xóa?")) {
        db.get('scripts').remove({ id: id }).write();
        showListScript()
    }
}

function detailScript(id) {
    let list = db.get('scripts').find({ id: id }).value().details
    let table = ""
    for (let i = 0; i < list.length; i++) {
        table += `<tr>
                    <td>${i + 1}</td>
                    <td>${list[i].account_name}</td>
                    <td><textarea id="${list[i].id}" readonly>${list[i].content}</textarea></td>
                    <td>${list[i].is_run == true ? "Đã chạy" : "Chưa chạy"}</td>
                    <td><input id="${list[i].id}_" type="datetime-local" value="${list[i].datetime.slice(0, 16)}" readonly /></td>
                    <td>
                    <button class="warning a_${i}" onclick="fixScript('${list[i].id}','${i}')">Sửa</button>
                    <button class="success a_${i}" onclick="saveScript('${list[i].id}','${id}','${i}')">Lưu</button>
                    </td>
                </tr>
                `
    }
    $(".popup-content").style.display = "block"
    $(".table-content tbody").innerHTML = table
}

function fixScript(detail_id, i) {
    let msg = document.getElementById(detail_id)
    msg.readOnly = false
    let time = document.getElementById(detail_id + "_")
    time.readOnly = false

    $(`.table-content .success.a_${i}`).style.display = "block"
    $(`.table-content .warning.a_${i}`).style.display = "none"
}

function saveScript(detail_id, id, i) {
    $(`.table-content .success.a_${i}`).style.display = "none"
    $(`.table-content .warning.a_${i}`).style.display = "block"
    let msg = document.getElementById(detail_id)
    msg.readOnly = true
    let time = document.getElementById(detail_id + "_")
    time.readOnly = true

    let scripts = db.get('scripts').find({ id: id }).value().details;
    let list = []
    for (let i = 0; i < scripts.length; i++) {
        let detail = db.get('scripts')
            .find({ id: id })
            .get(`details[${i}]`).value()

        let content = detail.content
        let datetime = detail.datetime
        if (detail.id == detail_id) {
            content = [msg.value]
            datetime = time.value
        }
        list.push({
            account_id: detail.account_id,
            account_name: detail.account_name,
            datetime: datetime,
            content: content,
            is_run: detail.is_run,
            id: detail.id
        })
    }
    db.get('scripts').find({ id: id }).assign({ details: list }).write()
}

function formatDate(date) {
    date = date.slice(0, 16)
    let day = date.split("T")[0].split("-").reverse().join("/")
    let time = date.split("T")[1]
    return time + " - " + day
}

$(".popup-content .btn").onclick = function () {
    $(".popup-content").style.display = "none"
}


function getListGroupGeneral() {
    let listGroup = db.get("groups").value()
    let listGroupGeneral = groupArray(listGroup, 'channel_id')

    let option_group = ""
    for (let i in listGroupGeneral) {
        option_group += `<option value="${listGroupGeneral[i][0].id + ';' + listGroupGeneral[i][0].title}">${listGroupGeneral[i][0].title}</option>`
    }
    document.querySelectorAll(".script_group").forEach(item => {
        item.innerHTML = option_group
    });
}
getListGroupGeneral()

function reRunScript(id) {
    let scripts = db.get('scripts').find({ id: id }).value().details;
    let dateCreated = moment().format();
    let list = []
    for (let i = 0; i < scripts.length; i++) {
        let duration = 0;

        if (i == 0) {
            // console.log({ duration, dateCreated, i })
        } else {
            duration = updateTime(scripts[i].datetime, scripts[i - 1].datetime)
            dateCreated = moment(dateCreated).add(duration, 'm').format()
            // console.log({ duration, dateCreated, i })
        }
        let detail = db.get('scripts')
            .find({ id: id })
            .get(`details[${i}]`).value()

        list.push({
            account_id: detail.account_id,
            account_name: detail.account_name,
            datetime: dateCreated,
            content: detail.content,
            is_run: false,
            id: detail.id
        })
        if (i == scripts.length - 1) {
            db.get('scripts').find({ id: id }).assign({ details: list }).write()
            showAbout('info', 'Thành Công', 'Chạy Lại Thành Công!');
        }
    }
}
function updateTime(max, min) {
    let maxDate = moment(max)
    let minDate = moment(min)
    return maxDate.diff(minDate, "m");
}
document.querySelector(".header").onclick = function () {
    location.reload()
}



