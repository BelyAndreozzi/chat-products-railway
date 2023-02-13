/* const path = require("path"); */
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const options = {
    mariaDB: {
        client: "mysql",
        connection: {
            host: "127.0.0.1",
            user: "root",
            password: "",
            database: "firstdatabase"
        }
    },
    sqliteDB: {
        client: "sqlite",
        connection: {
            filename: path.join(__dirname, "../database/chatdb.sqlite")
        },
        useNullAsDefault: true
    },
    mongoAtlas: {
        urlDB: "mongodb+srv://bely:coder32175@cluster0.jgo9tqh.mongodb.net/sessions?retryWrites=true&w=majority"
    }
}

export {options}