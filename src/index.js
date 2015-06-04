'use strict'

import storageMiddleware from './handlers'

export default class Storage {

  constructor (config = {}) {
    this.config = config
    this.engine = null
    this.models = {}
    this.connections = {}
  }

  initialize (resources, callback) {
    throw new Error('Storage adapters must implement initialize(resources, callback)')
  }

  middleware () {
    return storageMiddleware(this)
  }

  // getSchema() {
  //   return (req, res, next) => {
  //     req.storage = req.storage || {}
  //     if (req.swagger.operation.parameters && req.swagger.operation.parameters.length) {
  //       req.swagger.operation.parameters.forEach((parameter) => {
  //         if (parameter.in === 'body') {
  //           req.storage.schema = parameter.schema
  //           return next()
  //         }
  //       })
  //     }
  //     return next()
  //   }
  // }

  getModel (model) {
    // @todo Should this force the model to lowercase?
    return typeof model === 'object' ? model : this.models[model.toLowerCase()]
  }

  find (model, query, callback) {
    throw new Error('Storage adapters must implement find(model, query, callback)')
  }

  // @todo Does this method serve any real purpose?
  findOne (model, query, callback) {
    throw new Error('Storage adapters must implement findOne(model, query, callback)')
  }

  findById (model, id, callback) {
    throw new Error('Storage adapters must implement findById(model, id, callback)')
  }

  create (model, properties, callback) {
    throw new Error('Storage adapters must implement create(model, properties, callback)')
  }

  update (model, id, properties, callback) {
    throw new Error('Storage adapters must implement update(model, id, properties, callback)')
  }

  destroy (model, id, callback) {
    throw new Error('Storage adapters must implement destroy(model, id, callback)')
  }

}
