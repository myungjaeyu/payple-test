const express = require('express')
const request = require('request')

const port = 3000
const server = express()

const key = {
    cst_id: 'test',
    custKey: 'abcd1234567890'
}

server
    .use(express.static('.'))
    .use(express.json())
    .use(express.urlencoded({ extended : true }))
    .get('/authenticate', (req, res) => {

        const data = { 
            json: true, 
            url: 'https://testcpay.payple.kr/php/auth.php',
            form: { 
                ...key 
            }
        }

        request.post(data , (_, __, { result, ...args }) => {

            res.json({
                ...result === 'success' && args
            })

        })

    })

server.listen(port, err => console.log(`payple started on port ${ port }`))