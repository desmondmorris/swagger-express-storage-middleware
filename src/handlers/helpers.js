'use strict'

let debug = require('debug')('swagger:storage')

export function getId (req) {
  let idParam
  if (req.pathParams && req.swagger.params && req.swagger.params.length) {
    req.swagger.params.forEach((param) => {
      if (param.in === 'path') {
        idParam = param.name
      }
    })
  }
  if (idParam) {
    debug("Parsed ID '%s' from path", req.pathParams[idParam])
  }
  return req.pathParams[idParam]
}

export function respond (err, resource, res, next, statusCode = 200) {
  if (!err && resource) {
    res.status(statusCode)
    if (statusCode !== 204) {
      res.swagger.data = resource
    }
  }
  return next(err)
}
