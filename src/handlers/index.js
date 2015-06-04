'use strict'

let debug = require('debug')('swagger:storage')

import _ from 'lodash'

import resourceHandler from './resource'
import collectionHandler from './collection'

export default function (storage) {
  return function handler (req, res, next) {
    if (req.swagger && req.swagger.operation) {
      res.swagger = res.swagger || {}
      // Try to figure out what resource is being requested.
      determineRequestResource(req)
      let handler = determineRequestType(req) === 'resource' ? resourceHandler : collectionHandler
      return handler(storage)(req, res, next)
    }
    return next()
  }
}

/**
 * Determine if the request is for a resource or a collection.
 *
 * @param {Object} req
 * @return {String} requestType
 */
function determineRequestType (req) {
  var isResource = false
  let lastSegment = _.last(_.trim(req.swagger.pathName, '/ ').split('/'))
  // For now, just assume a resource if the last segment is a parameter.
  // @todo Inspect swagger operation and responses spec to do this for real.
  if (_.isString(lastSegment) && lastSegment.indexOf('{') === 0) {
    isResource = true
  } else if (req.method === 'POST') {
    isResource = true
  }
  req.swagger.requestType = isResource ? 'resource' : 'collection'
  debug('Determined request type: %s', req.swagger.requestType)
  return req.swagger.requestType
}

/**
 * Determine the resource being requested.
 *
 * @param {Object} req
 * @return {String} resourceType
 */
function determineRequestResource (req) {
  let resourceType = req.swagger.operation['x-resource'] || req.swagger.path['x-resource']
  if (resourceType) {
    req.swagger.resourceType = resourceType
  }
  debug('Determined resource type: %s', req.swagger.resourceType)
  return req.swagger.resourceType
}
