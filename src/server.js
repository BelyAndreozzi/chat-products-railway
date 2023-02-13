import express from 'express'
import handlebars from 'express-handlebars'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { Server, Socket } from 'socket.io'
import { options } from './config/databaseConfig.js' //
import { ContenedorSQL } from './managers/ContenedorSQL.js' //
import session from 'express-session'
import cookieParser from 'cookie-parser'
import MongoStore from 'connect-mongo'
import mongoose from 'mongoose'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { UserModel } from '../models/user.js'
import { envConfig } from './config/envConfig.js'
import parseArgs from 'minimist'
import { fork } from 'child_process'

//minimist
const optionsM = {default:{p:8080}, alias:{p:"port"}}
const args = parseArgs(process.argv.slice(2),optionsM)

//sv
const app = express()
const PORT = process.env.PORT || 8080 
const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))

const __dirname = dirname(fileURLToPath(import.meta.url))

//express
app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//Handlebars
app.engine("handlebars", handlebars.engine())
app.set("views", __dirname + "/views");
app.set('view engine', 'handlebars')

//Database connection 
mongoose.connect(envConfig.BASE_DE_DATOS, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (error) => {
    if (error) console.log("Conexión fallida");
    console.log("Base de datos conectada");
})


//Cookies & sessions
app.use(cookieParser())
app.use(session({
    store: MongoStore.create({
        mongoUrl: envConfig.BASE_DE_DATOS_SESSIONS
    }),
    secret: "claveSecreta",
    resave: false,
    saveUninitialized: false
}))

const productos = new ContenedorSQL(options.mariaDB, 'productos')
const mensajes = new ContenedorSQL(options.sqliteDB, 'mensajes')


const io = new Server(server)

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    //productos
    socket.emit('allProducts', await productos.getAll())

    socket.on('newProduct', async (data) => {
        await productos.save(data)


        await productos.getAll()
        io.sockets.emit('allProducts', await productos.getAll())
    })

    //mensajería 
    socket.emit("allMessages", await mensajes.getAll());

    //recibimos el mensaje
    socket.on("newMsgs", async (data) => {
        await mensajes.save(data);

        socket.emit('allMessages', await mensajes.getAll())

        io.sockets.emit("allMessages", await mensajes.getAll())
    })
})


//Passport 
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
    return done(null, user.id)
})
passport.deserializeUser((id, done) => {
    // con el id se busca en la db 
    UserModel.findById(id, (error, userFound) => {
        return done(error, userFound)
    })
})

// Sign up Local Strategy 
passport.use("signupStrategy", new LocalStrategy(
    {
        passReqToCallback: true,
        usernameField: "email"
    },
    (req, username, password, done) => {
        UserModel.findOne({ email: username }, (err, userFound) => {
            if (err) return done(err)
            if (userFound) return done(null, false, { message: "el usuario ya existe" })
            const newUser = {
                email: username,
                password: password
            }
            UserModel.create(newUser, (err, userCreated) => {
                if (err) return done(err, null, { mensaje: "Hubo un error al registrar el usuario" })
                return done(null, userCreated)
            })
        })
    }
))

// Login Local Strategy 
passport.use("loginStrategy", new LocalStrategy(
    {
        passReqToCallback: true,
        usernameField: "email"
    },
    (req, username, password, done) => {
        UserModel.findOne({ email: username }, (err, userFound) => {
            if (err) { return done(err); }
            if (!userFound) { return done(null, false); }
            if ( userFound.password != password) { return done(null, { mensaje: "Contraseña incorrecta" }); }
            return done(null, userFound)
        })
    }
))

//endpoints

app.get('/', (req, res) => {
    res.render('form')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/signup', passport.authenticate("signupStrategy", {
    failureRedirect: "/failSignup",
    failureMessage: true,

}), (req, res) => {
    console.log(req.session.passport.username)
    res.redirect("/")
})

app.get('/failSignup', (req,res)=>{
    res.render('failSignup')
})

app.get('/login', (req, res) => {
    res.render('login')
})


app.post('/login', passport.authenticate("loginStrategy", {
    failureRedirect: "/login",
    failureMessage: true,

}), (req, res) => {
    const {email} = req.body
    req.session.passport.username = email
    res.redirect("/")
})

app.get('/failLogin', (req,res)=>{
    res.render('failLogin')
})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/')
        res.render("logout")
    })
})

app.get("/info", (req,res)=>{
    res.render('info', {argsEntrada: process.argv.slice(2), 
        sistOperativo: process.platform, 
        node: process.version, 
        rss: process.memoryUsage.rss(), 
        pathEjecucion: process.execPath, 
        pid: process.pid, 
        carpetaProyecto: process.cwd()} )
})

app.get('/api/randoms', (req,res)=>{
    const child = fork('./src/childProcess/randomNumChild.js')
    const cantNum =  req.query.cantNum || 100000000
    child.on('message', (childMsg)=>{
        if (childMsg == 'Listo') {
            child.send('Iniciar ' + cantNum)
        } else {
            res.render('numerosRandom', {childMsg: JSON.stringify(childMsg)})
        }
    })

})


