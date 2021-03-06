const test = require('ava')
const e2k = require('..')
const Koa = require('koa')
const Router = require('koa-router')
const axios = require('axios')

const ROUTES = [
  ['get', '/get', (req, res, next) => {
    res.end('get')
  }],

  ['get', '/get2', (req, res) => {
    res.end('get2')
  }],

  ['post', '/post', (req, res, next) => {
    next()
  }],

  ['post', '/post', (req, res, next) => {
    res.end('post')
  }],

  ['post', '/post2', (req, res, next) => {
    res.statusCode = 201
    res.end('post2')
  }]
]

test.before(t => {
  const app = new Koa
  const router = new Router()

  ROUTES.forEach(([method, pathname, middleware]) => {
    router[method](pathname, e2k(middleware))
  })

  app.use(router.routes())
  return new Promise((resolve) => {
    app.listen(8889, resolve)
  })
})


function request (method, pathname) {
  return axios[method](`http://localhost:8889${pathname}`)
}


const CASES = [
  ['get', '/get', 'get'],
  ['get', '/get2', 'get2'],
  ['post', '/post', 'post'],
  ['post', '/post2', 'post2', 201]
]

CASES.forEach((c) => {
  test.cb(c.join(', '), t => {
    const [
      method,
      pathname,
      body,
      code
    ] = c

    request(method, pathname)
    .then(({data, status}) => {
      t.is(data, body)
      t.is(status, code || 200)
      t.end()
    })
  })
})
