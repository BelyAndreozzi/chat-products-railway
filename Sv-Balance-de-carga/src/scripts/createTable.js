const {options} = require('../config/databaseConfig')
const knex = require('knex')

const databaseMariaDb = knex(options.mariaDB)
const databaseSqlite = knex(options.sqliteDB)

const createTables = async() => {
    try {
        let productosTable = await databaseMariaDb.schema.hasTable('productos')
        if (productosTable) {
            await databaseMariaDb.schema.dropTable('productos')
        }
        await databaseMariaDb.schema.createTable('productos', table=>{
            table.increments('id')
            table.string("title", 40).nullable(false)
            table.integer("price").nullable(false)
            table.string('thumbnail',200).nullable(false)
        })
        console.log('Productos table created');

        let mensajesTable = await databaseSqlite.schema.hasTable('mensajes')
        if (mensajesTable) {
            await databaseSqlite.schema.dropTable('mensajes')
        }
        await databaseSqlite.schema.createTable('mensajes', table=>{
            table.increments('id')
            table.string('email', 40).nullable(false)
            table.string('date', 20)
            table.string('msg', 200)
        })
        console.log('Mensajes table created');

    } catch (error) {
        console.log('error', error);
    }
    databaseMariaDb.destroy()
    databaseSqlite.destroy()
}
createTables()