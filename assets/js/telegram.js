const { MTProto } = require('telegram-mtproto')
const { Storage } = require('mtproto-storage-fs')
const inputReader = require('wait-console-input')
const Phone = require('phone')
const fs = require('fs')

// telegram.initConnection()
// telegram.on('messages.receivedMessages', function (message) {
//     console.log({ message })
// })


// const getChat = async () => {
//     const dialogs = await telegram('messages.sendMessage', {
//         message: "hello",
//         peer: { inputPeerUser: '460472746' }
//     })
//     console.log(dialogs)
// }
// getChat().then()
var telegram = null;
async function requestCodeLogin(api_id, app_id, phone) {

    let statusS = false;
    try {

        // console.log({ checkExistFiles })
        // return ;

        api_id = parseInt(api_id)
        const api = {
            invokeWithLayer: 0xda9b0d0d,
            layer: 57,
            initConnection: 0x69796de9,
            api_id: api_id,
            app_version: '1.0.1',
            lang_code: 'en'
        }

        const server = { dev: false }
        const app = {
            storage: new Storage('./license/' + phone + '.json')
        }

        telegram = MTProto({ api, server, app })
        // console.log({telegram})
        // return 
        //check is login
        const config = {
            id: api_id,
            hash: app_id
        }

        const { phone_code_hash } = await telegram('auth.sendCode', {
            phone_number: phone,
            current_number: false,
            api_id: parseInt(config.id),
            api_hash: config.hash
        })
        return { status: true, phone_code_hash }
    } catch (error) {
        return { status: false, error: error }
    }

    // .then(async data => {
    //     console.log({ data })
    //     let input = inputReader.readInteger('Input code telegram: ');
    //     console.log({ input })
    //     console.log({
    //         phone_number: phone,
    //         phone_code_hash: data.phone_code_hash,
    //         phone_code: input
    //     })
    //     let aaa = {
    //         phone_number: phone,
    //         phone_code_hash: data.phone_code_hash,
    //         phone_code: input.toString()
    //     }
    //     const res = await telegram('auth.signIn', aaa)
    //     const { user } = res
    //     const {
    //         first_name = '',
    //         username = ''
    //     } = user
    //     console.log('signIn', first_name, username, user.phone)
    // })
}
// requestCodeLogin(2977363, 'ef82e70a33293188f8466dd083a743e9', '+84839575644').then();
function phoneFormat(phone) {
    try {
        let phones = Phone(phone, 'VNM');
        return phones[0]
    } catch (error) {
        return ""
    }
}
async function checkLoginAccount(telegram) {
    try {
        let { chats } = await telegram('messages.getDialogs', { limit: 1 });
        if (!chats) {
            return { status: false }
        } else {
            return { status: true }
        }
    } catch (error) {
        console.log({ error })
        return { status: false }
    }
}
async function addAccount() {
    const account_phone = document.getElementById("account_phone")
    const account_api_id = document.getElementById("account_api_id")
    const account_app_id = document.getElementById("account_app_id")
    const btn_add_account_btn_step2 = document.getElementById("add_account_btn_step2")
    if (!account_phone.value) {
        showAbout('error', 'Lỗi', 'Số Điện Thoại Không Được Để Trống!');
        return;
    }
    let phoneF = phoneFormat(account_phone.value);
    if (!phoneF) {
        showAbout('error', 'Lỗi', 'Số Điện Thoại Không Đúng!');
        return;
    }
    account_phone.value = phoneF

    if (!account_api_id.value) {
        showAbout('error', 'Lỗi', 'API ID Không Được Để Trống!');
        return;
    }
    if (!account_app_id.value) {
        showAbout('error', 'Lỗi', 'APP ID Không Được Để Trống!');
        return;
    }
    let checkExistFiles = checkExistFile('./license/' + account_phone.value + '.json')
    if (checkExistFiles) {
        showAbout('error', 'Lỗi', 'Tài Khoản Đã Tồn Tại!');
        return;
    }


    refresh_interface_account(true)
    let resultRequestCodeLogin = await requestCodeLogin(account_api_id.value, account_app_id.value, account_phone.value);
    if (!resultRequestCodeLogin.status) {
        showAbout('error', 'Lỗi', resultRequestCodeLogin.error);
    }
    btn_add_account_btn_step2.style.display = 'block'

    document.getElementsByClassName('div-confirm-code')[0].style.display = 'block'
    document.getElementById("add_account_btn").style.display = 'none'
    document.getElementById("phone_code_hash").value = resultRequestCodeLogin.phone_code_hash;
    console.log({ resultRequestCodeLogin })
    return resultRequestCodeLogin;

}

async function addAccountStep2() {
    const account_phone = document.getElementById("account_phone")
    const account_code = document.getElementById("account_code")
    const account_api_id = document.getElementById("account_api_id")
    const account_app_id = document.getElementById("account_app_id")
    try {
        if (!account_code.value) {
            showAbout('error', 'Lỗi', 'Phải Nhập Mã Xác Nhận!');
            return;
        }
        const dataConfirm =
        {
            phone_number: account_phone.value,
            phone_code_hash: document.getElementById("phone_code_hash").value,
            phone_code: account_code.value
        }
        console.log({ dataConfirm })
        const res = await telegram('auth.signIn', dataConfirm)
        const { user } = res;
        db.get('accounts')
            .push({
                id: uuidv4(), phone: account_phone.value,
                code: account_code.value, api_id: account_api_id.value,
                app_id: account_app_id.value, user,
                phone_code_hash: document.getElementById("phone_code_hash").value,
                created_at: new Date().toLocaleDateString()
            })
            .write()
        showListAccount()
        showAbout('info', 'Thành Công', 'Thêm Tài Khoản Thành Công!');
        location.reload()
        console.log({ res })
    } catch (error) {
        showAbout('error', 'Lỗi', 'Có Lỗi Xãy Ra Hãy Làm Lại!');
        fs.unlink('./license/' + account_phone.value + '.json', function (err) {
            if (err) return console.log(err);
            console.log('file deleted successfully');
        });
        return;
    }

}
function refresh_interface_account(status) {
    if (status) {
        account_phone.disabled = true;
        account_api_id.disabled = true;
        account_app_id.disabled = true;
        document.getElementById("add_account_btn").disabled = true
        document.getElementById("add_account_btn").innerText = "Đang Gửi Mã!"
    } else {
        account_phone.disabled = false;
        account_api_id.disabled = false;
        account_app_id.disabled = false;
        document.getElementById("add_account_btn").disabled = false
        document.getElementById("add_account_btn").innerText = "Gửi Mã Login"
    }
}

function checkExistFile(path) {
    try {
        if (fs.existsSync(path)) {
            return true
        } else {
            return false
        }
    } catch (err) {
        return false
    }
}


class TelegramLogged {
    constructor(details) {
        this.detail = details;
        this.init()
        this.mListChat = [];
        this.offset_id = 0;
    }
    get() {
        return this.detail
    }

    init() {
        let api_id = parseInt(this.detail.api_id)
        const api = {
            invokeWithLayer: 0xda9b0d0d,
            layer: 57,
            initConnection: 0x69796de9,
            api_id: api_id,
            app_version: '1.0.1',
            lang_code: 'en'
        }

        const server = { dev: false }
        const app = {
            storage: new Storage('./license/' + this.detail.phone + '.json')
        }
        this.client = MTProto({ api, server, app })
    }

    async getListChat() {
        let a = { dialogs: [], chats: [], messages: [], users: [] }
        this.mListChat = await this.handleGetListChat(1, 100);
        // console.log(this.mListChat)
    }

    async searchGroup() {
        const dialogs = await this.client('messages.searchGlobal', {
            q: 'xuanson',
            limit: 100
        })
        console.log({ dialogs })
    }

    async sendMessageUser(chat_id, messages) {
        try {
            let result = await this.client('messages.sendMessage', {
                peer: {
                    _: 'inputPeerChat',//inputPeerUser,inputPeerChannel
                    chat_id: chat_id,//user_id,channel_id
                    // access_hash: '15600334516801790390'
                },
                message: messages,
                random_id: (Math.floor((new Date().getTime() + (Math.random() * 88) + 11) % 1000000000)),
            })
            return true;
        } catch (error) {
            return false;
        }
    }

    async sendMessageChannel(channel_id, access_hash, messages) {
        console.log({ channel_id, access_hash, messages })
        try {
            let result = await this.client('messages.sendMessage', {
                peer: {
                    _: 'inputPeerChannel',//inputPeerUser,inputPeerChannel
                    channel_id: channel_id,//user_id,channel_id
                    access_hash: access_hash
                },
                message: messages,
                random_id: (Math.floor((new Date().getTime() + (Math.random() * 88) + 11) % 1000000000)),
            })
            console.log('send channel', { result })
            return true;
        } catch (error) {
            return false;
        }
    }

    async getListContacts() {
        const dialogs = await this.client('contacts.getContacts')
        console.log({ dialogs })
    }

    async createChannel() {
        const dialogs = await this.client('channels.createChannel', {
            title: 'test11212',
            about: 'kiem tra create ',
            address: 'HO CHI MINH'
        })
        console.log({ dialogs })
    }
    async getMemberChannel(page) {
        let detailChannel = db.get("groups").find({ ids: '0502f49c-b5ba-4ecb-9304-5b94f8637f04' }).value();
        console.log({ detailChannel })
        // let result = await this.client('channels.getChannels', {
        //     id: [
        //         {
        //             _: 'inputChannel',
        //             channel_id: '1455232982',
        //             access_hash: "16594595049741307594"
        //         }
        //     ]
        // })
        // let result = await this.client('channels.getFullChannel', {
        //     channel: {
        //         _: 'inputChannel',
        //         channel_id: '1455232982',
        //         access_hash: '16594595049741307594'
        //     }
        // })

        // let page = 2;
        let limit = 200
        let offset = (page - 1) * limit;
        let hash = (((16594595049741307594 * 0x4F25) & 0x7FFFFFFF) + 16594595049741307594) & 0x7FFFFFFF
        let { users } = await this.client('channels.getParticipants',
            {
                channel: {
                    _: 'inputChannel',
                    channel_id: '1455232982',
                    access_hash: '16594595049741307594',
                },
                filter: {
                    _: 'channelParticipantsRecent',
                },
                limit: limit,
                hash: hash,
                offset: offset
            })
        console.log(users[users.length - 1])
    }
    async handleGetListChat(page = 1, limit = 100, offset_id, hash) {
        try {
            console.log({ page })
            let offset = (page - 1) * limit;
            let { dialogs, chats, messages, users, count } = await this.client('messages.getDialogs', { limit, offset })
            // let aaaa = await this.client('messages.getDialogs', {
            //     offset_date: 0,
            //     limit,
            //     offset_id: offset_id,
            // })
            // let aaaa = await this.client('messages.getHistory', { limit, offset })
            // console.log(JSON.stringify(aaaa))
            for (let item of chats) {
                if (item["_"].indexOf('Forbidden') == -1) {
                    let checkChannel = db.get("groups").find({ channel_id: item.id, account_id: this.detail.id }).value();
                    if (!checkChannel) {
                        delete item.photo;
                        db.get("groups").push({ ...item, channel_id: item.id, ids: uuidv4(), account_id: this.detail.id, created_at: new Date().toLocaleDateString() })
                            .write()
                    }
                }

            }
            showAbout('info', 'Thành Công', 'Đã Lấy Danh Sách Group Thành Công!')
            document.querySelector("#getGroupList").innerHTML = 'Lấy DS nhóm'
            location.reload()
            showListGroup()
        } catch (error) {
            console.log(error)
            showAbout('error', 'Lỗi', 'Có Lỗi Xãy Ra Xin Làm Lại!')
        }

        // return { dialogs, chats, messages, users, count }
    }
}
var page = 1;
var offset_id = 0;
var hash = ""
async function getGroupAccount(account_id) {
    document.querySelector("#getGroupList").innerHTML = `<div class="loader"></div>`
    //check account_id
    let details = db.get('accounts').find({ id: account_id }).value();
    if (!details) {
        ShowAbout('error', 'Lỗi', 'Tài Khoản Không Tồn Tại!')
        document.querySelector("#getGroupList").innerHTML = 'Lấy DS nhóm'
        return;
    }
    let checkExistFiles = checkExistFile('./license/' + details.phone + '.json')
    if (!checkExistFiles) {
        showAbout('error', 'Lỗi', 'Tài Khoản Không Tồn Tại!');
        document.querySelector("#getGroupList").innerHTML = 'Lấy DS nhóm'
        return;
    }
    let tele_ = new TelegramLogged(details)
    console.log({ offset_id })
    let aaa = await tele_.handleGetListChat()
    // let aaa = await tele_.createChannel(page)
    page++;

}
// console.log('hash',(((111 * 0x4F25) & 0x7FFFFFFF) + 111) & 0x7FFFFFFF)