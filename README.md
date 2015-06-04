# Swagger Express Storage Middleware

Storage engine middleware for use with [Swagger Express Middleware](https://github.com/BigstickCarpet/swagger-express-middleware).

Currently supports the following storage adapters:

- [Waterline](https://github.com/balderdashy/waterline)

## Installation

```bash
npm install swagger-express-storage-middleware --save
```

## Example Usage

```javascript
var path = require('path')
var express =  require('express')
var swagger = require('swagger-express-middleware')
// Load the desired storage adapter layer.
var Storage = require('swagger-express-storage-middleware/lib/adapters/waterline')

// Initialize Express application.
var app = express()
// Get the full path to the Swagger specification.
var spec = path.join(__dirname, 'api/spec.yaml')
// Load the storage engine adapter configuration.
var storage = new Storage(require('./storage/disk-adapter'))

// Parse the Swagger specification and initialize Swagger Express middleware.
swagger(spec, app, function (err, middleware, apiObject, apiMetadata) {
  if (err) {
    console.error(err)
  }

  // Initialize storage engine using model schema definitions.
  storage.initialize(apiObject.definitions, function (err) {
    if (err) {
      console.error(err)
    }

    // Load Swagger Express middleware.
    app.use(middleware.metadata())
    app.use(middleware.files())
    app.use(middleware.CORS())
    app.use(middleware.parseRequest())
    app.use(middleware.validateRequest())

    // Add custom middleware to the chain.
    app.use(function(req, res, next) {
      return next()
    })

    // Load storage middleware.
    app.use(storage.middleware())

    // Respond the the request if data was found in the storage engine.
    // The storage middleware sets the `res.swagger.data` property if a
    // resource is found. However, it needs to be returned to the client.
    // The storage middleware does not return the result so that additional
    // processing can be done, if desired.
    app.use(function(req, res, next) {
      if (res.swagger && res.swagger.data) {
        res.setHeader('X-Powered-By', 'Swagger Express')
        return res.json(res.swagger.data)
      } else if (res.statusCode === 204) {
        return res.end()
      }
      return next()
    })

    // Add 404 handler for non-Swagger routes.
    app.use(function finalHandler (req, res, next) {
      return res.status(404).json({
        code: 404,
        message: '404 Error: Resource not found'
      })
    })

    // Add final Express error handler.
    app.use(function errorHandler (err, req, res, next) {
      return res.status(err.status).json({
        code: err.status,
        message: err.message
      })
    })

    // Start the server.
    var server = app.listen(process.env.PORT || 3000, function(err) {
      console.log('%s is now running on port %d', apiObject.info.title, server.address().port)
    })
  })
})
```

```javascript
// storage/disk-adapter.js
var path = require('path')

module.exports = {
  adapters: {
    default: require('sails-disk')
  },
  connections: {
    default: {
      adapter: 'default',
      filePath: path.join(__dirname, 'tmp/')
    }
  },
  defaults: {
    migrate: 'safe'
  }
}
```
