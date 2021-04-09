var timeOutScrupt;
var flagRun = true;
var loopRunScript = function () {
    timeOutScrupt = setInterval(async function () {
        console.log("step1: run loop send script!")
        if (!flagRun) {
            clearInterval(timeOutScrupt)
            return;
        }
        let listScript = db.get('scripts').value()
        let ikk = 0;
        for (let itemScript of listScript) {
            let kdetail = 0;
            for (let detail of itemScript.details) {
                if (!detail.is_run) {
                    let dataItemDetail = detail.datetime;
                    if (new Date(dataItemDetail) < new Date()) {
                        //get detail account details
                        let detailAccount = db.get('accounts').find({ id: detail.account_id }).value()
                        console.log({ account_id: detail.account_id, channel_id: parseFloat(itemScript.group_id) })
                        let detailChannel = db.get('groups').find({ account_id: detail.account_id, channel_id: parseFloat(itemScript.group_id) }).value()
                        if (detailAccount) {
                            let teleGramTool = new TelegramLogged(detailAccount)
                            // console.log('send message', detail, detailAccount, detailChannel)
                            // console.log('update status detail',teleGramTool)
                            //send message to
                            if (detailChannel['_'] == 'channel') {
                                // teleGramTool.sendMessageChannel(detailChannel.channel_id, detailChannel.access_hash, detail.content[0]);
                                // db.get(`scripts[${ikk}].details`)
                                //     .find({ id: detail.id })
                                //     .assign({ is_run: true })
                                //     .write()

                                let results = await teleGramTool.sendMessageChannel(detailChannel.channel_id, detailChannel.access_hash, detail.content[0]);
                                if (results) {
                                    db.get(`scripts[${ikk}].details`)
                                        .find({ id: detail.id })
                                        .assign({ is_run: true })
                                        .write()
                                    location.reload()
                                }
                            }
                            if (detailChannel['_'] == 'chat') {
                                // teleGramTool.sendMessageUser(detailChannel.channel_id, detail.content[0]);
                                // db.get(`scripts[${ikk}].details`)
                                //     .find({ id: detail.id })
                                //     .assign({ is_run: true })
                                //     .write()

                                let results = await teleGramTool.sendMessageUser(detailChannel.channel_id, detail.content[0]);
                                if (results) {
                                    db.get(`scripts[${ikk}].details`)
                                        .find({ id: detail.id })
                                        .assign({ is_run: true })
                                        .write()
                                    location.reload()
                                }
                            }
                        }
                    }
                }
            }
            ikk++;
        }
        // console.log({ listScript })
    }, 5000)
}

loopRunScript()