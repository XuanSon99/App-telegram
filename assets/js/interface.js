let menu = document.querySelectorAll(".menu span")
let router = document.querySelectorAll(".content>div")
for (let i = 0; i < menu.length; i++) {
    menu[i].onclick = function () {
        menu.forEach(i => {
            i.classList.remove("active")
        })
        menu[i].classList.add("active")

        router.forEach(item => {
            item.style.display = "none"
        });
        router[i].style.display = "block"
    }
}

function $(id) {
    return document.querySelector(id)
}

function openNav() {
    let nav = document.querySelector(".nav")
    let bar = document.querySelector(".bar")
    let content = document.querySelector(".content")
    if (nav.style.top == "0px") {
        nav.style.top = "100vh"
        nav.style.left = "-250px"
        bar.style.left = "0px"
        content.style.left = "0px"
        content.style.width = "100%"
    } else {
        nav.style.top = "0px"
        nav.style.left = "0px"
        bar.style.left = "251px"
        content.style.left = "250px"
        content.style.width = "calc(100% - 250px)";
    }
}

function showListAccount() {
    let List = db.get('accounts').value()
    let tbody = ""
    for (let i = 0; i < List.length; i++) {
        tbody += `<tr>
              <td>${i + 1}</td>
              <td>${List[i].user.username}</td>
              <td>${List[i].phone}</td>
              <td>${List[i].api_id}</td>
              <td>${List[i].app_id}</td>
              <td>${List[i].created_at}</td>
              <td style="display: flex; justify-content: center;">
                <button class="success" id="getGroupList" onclick="getGroupAccount('${List[i].id}')">Lấy DS nhóm</button>
                <button class="danger" onclick="removeAccount('${List[i].id}', '${List[i].phone}')">Xóa</button>
              </td> 
            </tr>`
    }
    document.querySelector(".account-list tbody").innerHTML = tbody
}
showListAccount()

function showListGroup() {
    let List = db.get('groups').value()
    let tbody = ""
    for (let i = 0; i < List.length; i++) {
        let username = db.get("accounts").find({ id: List[i].account_id }).value();
        tbody += `<tr>
              <td>${i + 1}</td>
              <td>${List[i].title}</td>
              <td>${List[i].channel_id}</td>
              <td>${username.phone}</td>
              <td>${List[i].created_at}</td>
            </tr>`
    }
    document.querySelector(".group-list tbody").innerHTML = tbody
}
showListGroup()
$(".cover").onclick = function () {
    $(".popup-detail").style.display = "none"
    $(".cover").style.display = "none"
}

function removeAccount(id, phone) {
    if (confirm("Chắc chắn xóa?")) {
        let path = 'license/' + phone + ".json"
        fs.unlink(path, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
        db.get('accounts').remove({ id: id }).write();
        showListAccount()
    }
}

// $(".bar").onclick = function () {
//     location.reload()
// }

