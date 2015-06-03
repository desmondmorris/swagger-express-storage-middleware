'use strict';

let debug = require('debug')('swagger:storage');

const methods = {
  GET: find,
  HEAD: find,
  OPTIONS: find,
  POST: create,
  DELETE: destroy,
  // POST: mergeResource,
  // PATCH: mergeResource,
  // PUT: overwriteResource,
};

let Storage;

export default function handler(storage) {
  Storage = storage;
  return (req, res, next) => {
    return methods[req.method](req, res, next);
  }
}

function getId(req) {
  let idParam;
  if (req.pathParams && req.swagger.params && req.swagger.params.length) {
    req.swagger.params.forEach((param) => {
      if (param.in === 'path') {
        idParam = param.name;
      }
    });
  }
  return req.pathParams[idParam];
}

function find(req, res, next) {
  Storage.findById(req.swagger.resourceType, getId(req), (err, resource) => {
    return respond(err, resource, res, next);
  });
}

function create(req, res, next) {
  if (req.swagger.params && req.swagger.params.length) {
    req.swagger.params.forEach((param) => {
      if (param.in === 'body') {
        createResource(req, (err, resource) => {
          return respond(err, resource, res, next);
        });
      }
    });
  } else {
    return next();
  }
}

function destroy(req, res, next) {
  destroyResource(req, (err, resource) => {
    return respond(err, resource, res, next, 204);
  });
}

function createResource(req, callback) {
  Storage.create(req.swagger.resourceType, req.body, callback);
}

function destroyResource(req, callback) {
  Storage.destroy(req.swagger.resourceType, getId(req), callback);
}

function respond(err, resource, res, next, statusCode = 200) {
  if (!err && resource) {
    res.status(statusCode);
    if (statusCode !== 204) {
      res.swagger.data = resource;
    }
  }
  return next(err);
}
