const express = require('express')
const app = express()
const http = require('http')
const bodyParser = require('body-parser')
let users = []
const bcrypt = require('crypto')
const fileUpload = require('express-fileupload')



var data = [
    { id: 1, title: "react", price: "200", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
    { id: 2, title: "react-native", price: "300", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
    { id: 3, title: "flutter", price: "400", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
    { id: 4, title: "unity", price: "500", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
    { id: 5, title: "node js", price: "600", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
]
let id = data.length
function App() {
    const server = http.createServer(app)
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(fileUpload({
        createParentPath: true
    }))

    app.get('/', (req, res) => {
        res.json({ data: data })
    })

    app.delete('/delete', (req, res) => {
        let data1 = data
        data = data1.filter((d) => {
            return !(d.id == req.query.id)
        })
        res.status(200).json({ data: data })
    })

    app.post('/add', (req, res) => {
        try {

            var errors = []

            if (req.body.title.length < 1) {
                errors.push({ key: 'title', errorText: "عنوان وارد نشده است." })
                res.status(400).json({ errors: errors })
                return
            }
            var image = req.body.img && req.body.img !== "" ? req.body.img : ""
            var price = req.body.price && req.body.price !== "" ? req.body.price : "0"
            data.push({
                id: id + 1,
                title: req.body.title,
                price: price,
                img: image

            })

            id = id + 1
            res.status(201).json({ data: data })
        } catch (e) {
            res.status(500).json({})
        }
    })

    app.post('/signup', (req, res) => {
        try {

            var errors = []
            var pattern = /^[a-z0-9]{1,}@[a-z0-9]{1,}\.[a-z]{1,}$/i


            if (!pattern.test(req.body.email) || req.body.password.length < 6) {

                if (!pattern.test(req.body.email)) {
                    errors.push({ key: 'email', errorText: "فرمت ایمیل اشتباه است." })
                }
                if (req.body.password.length < 6) {
                    errors.push({ key: 'password', errorText: "پسورد اشتباهست." })
                }


                res.status(400).json({ errors: errors })
                return
            }

            var err = false
            users.forEach(user => {
                if (user.email === req.body.email) {
                    err = true

                }
            });
            if (err) {
                errors.push({ key: 'email', errorText: "کاربر قبلا ثبت نام کرده است." })
                res.status(400).json({ errors: errors })
                return
            }



            users.push({ email: req.body.email, password: req.body.password, token: "", token_type: "" })
            console.log(users);

            res.status(201).json({ users })
        } catch (e) {
            res.status(500).json({})
        }
    })

    app.post('/signin', (req, res) => {
        try {

            var errors = []
            var pattern = /^[a-z0-9]{1,}@[a-z0-9]{1,}\.[a-z]{1,}$/i


            if (!pattern.test(req.body.email) || req.body.password.length < 6) {

                if (!pattern.test(req.body.email)) {
                    errors.push({ key: 'email', errorText: "فرمت ایمیل اشتباه است." })
                }
                if (req.body.password.length < 6) {
                    errors.push({ key: 'password', errorText: "پسورد اشتباهست." })
                }


                res.status(400).json({ errors: errors })
                return
            }

            var success = false
            var token = bcrypt.createHmac('sha256', Date.now + req.body.email).digest('base64')
            users.forEach(user => {
                if (user.email === req.body.email && user.password === req.body.password) {
                    user.token = token
                    user.token_type = "Bearer"
                    success = true
                }
            });
            if (!success) {
                res.status(403).json({ errorText: 'کاربر یافت نشد' })
                return
            }
            res.status(200).json({ token: token, token_type: 'Bearer' })

            // res.status(201).json({ users })
        } catch (e) {
            res.status(500).json({})
        }
    })

    app.put('/update', (req, res) => {
        var errors = []
        if (req.body.title.length === 0) {
            errors.push({ key: 'title', errorText: "عنوان وارد نشده است." })
            res.status(400).json({ errors: errors })
            return
        }
        data.forEach(d => {
            if (d.id == req.query.id) {
                d.title = req.body.title
            }
        })
        res.status(200).json({ data: data })
    })

    app.get('/paginate', (req, res) => {

        let [token_type, token] = req.header('Authorization') && req.header('Authorization').length > 0 ?
            req.header('Authorization').split(' ') : ["", ""]

        //split tabdil mikonad b array
        let isLogin = false
        if (token == "" || token_type == "") {
            isLogin = false
        } else {
            users.forEach(user => {
                if (user.token == token && user.token_type == token_type) {
                    isLogin = true

                }

            });

        }
        if (!isLogin) {
            res.status(401).json('not authorize')
        }


        if (req.query.page == 1) {
            res.status(200).json({
                curren_page: req.query.page,
                count: data.length,
                last_page: 2,
                data: [
                    { id: 1, title: "react", price: "200", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
                    { id: 2, title: "react-native", price: "300", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
                    { id: 3, title: "fluttrt", price: "400", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
                ]
            })
            return
        } else if (req.query.page == 2) {
            res.status(200).json({
                curren_page: req.query.page,
                count: data.length,
                last_page: 2,
                data: [
                    { id: 4, title: "unity", price: "500", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
                    { id: 5, title: "node js", price: "600", img: "https://api.reactnativedeveloper.ir/storage/notification_image/aIWCuQCfdElK1p6WoCAoLK3g8X5bVkYcLVsCUpwF.png" },
                ]

            })
            return
        }
    })

    app.post('/upload', (req, res) => {
        try {
            if (req.files.image.mimetype === 'image/png' || req.files.mimetype === 'image/jpeg') {
                req.files.image.mv('./upload/' + req.files.image.name)
                res.status(201).json([])
                return
            } else {
                res.status(400).json({ errorText: "فرمت فایل وارد شده اشتباه است" })
            }
        } catch (error) {
            res.status(500).json({})
        }
    })

    app.get('/profile', (req, res) => {

        let [token_type, token] = req.header('Authorization').split(' ')
        //split tabdil mikonad b array
        users.forEach(user => {
            if (user.token == token && user.token_type == token_type) {
                res.status(200).json({ user: user })
                return
            }

        })
        res.status(401).json('not auth')
        // res.json({ token_type, token })
    })




    server.listen(3000, () => {
        console.log('Server run on port 3000')
    })
}
module.exports = App