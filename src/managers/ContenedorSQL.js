import knex from 'knex'

class ContenedorSQL {
    constructor(options, tableName) {
        this.database = knex(options)
        this.table = tableName
    }

    async getAll() {
        try {
            const response = await this.database.from(this.table).select('*')
            return response
        } catch (error) {
            return `ERROR: ${error}`
        }
    }

    async save(item){
        try {
            const [id] = await this.database.from(this.table).insert(item)
            return `Product id '${id} added succesfully'`
        } catch (error) {
            return `ERROR: ${error}`
        }
    }
}

export {ContenedorSQL}