import session, {SessionOptions} from 'express-session'

const sessionConfig:SessionOptions = {
    secret: 'secret', //I know I shouldn't do this, but I don't know the proper way to do it yet. Will look into later
    cookie:{
        secure:false
    },
    resave:false,
    saveUninitialized: false
}

export const sessionMiddleware = session(sessionConfig)