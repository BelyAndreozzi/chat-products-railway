import * as dotenv from 'dotenv'
dotenv.config()

export const envConfig={
    MODO: process.env.MODO || 'dev',
    BASE_DE_DATOS: process.env.BASE_DE_DATOS || "mongodb+srv://bely:coder32175@cluster0.jgo9tqh.mongodb.net/authDB?retryWrites=true&w=majority",
    BASE_DE_DATOS_SESSIONS: process.env.BASE_DE_DATOS_SESSIONS || "mongodb+srv://bely:coder32175@cluster0.jgo9tqh.mongodb.net/sessions?retryWrites=true&w=majority"
}
