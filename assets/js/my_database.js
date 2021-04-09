const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const { v4: uuidv4 } = require('uuid');
const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ accounts: [], scripts: [], groups: [], contacts: [] })
    .write()