const validator = require('is-my-json-valid')
const fs = require('fs')

const environmentSchema = require('./schemas/environment')
const environmentUpdateSchema = require('./schemas/environmentUpdate')
const namespaceSchema = require('./schemas/namespace')
const namespaceUpdateSchema = require('./schemas/namespaceUpdate')
const flagSchema = require('./schemas/flag')
const flagUpdateSchema = require('./schemas/flagUpdate')
const apiKeySchema = require('./schemas/apikey')
const selectorRequestSchema = require('./schemas/selectorRequest')
const valueUpdateSchema = require('./schemas/valueUpdate')

const validators = [
  { name: 'environment', schema: environmentSchema },
  { name: 'environmentUpdate', schema: environmentUpdateSchema },
  { name: 'namespace', schema: namespaceSchema },
  { name: 'namespaceUpdate', schema: namespaceUpdateSchema },
  { name: 'apiKey', schema: apiKeySchema },
  { name: 'flag', schema: flagSchema },
  { name: 'flagUpdate', schema: flagUpdateSchema },
  { name: 'selectorRequest', schema: selectorRequestSchema },
  { name: 'valueUpdate', schema: valueUpdateSchema }
]

const capitalize = (s) => s[0].toUpperCase() + s.substr(1)
const eslintDisables = '/* eslint-disable no-constant-condition */\n'

validators.forEach(v => {
  const validate = validator(v.schema)

  const fd = fs.openSync(`./${v.name}.ts`, 'w')
  const fnCode = eslintDisables + validate.toString()

  fs.writeSync(fd,
    fnCode
      .replace(
        'function validate(data)',
        `export function validate${capitalize(v.name)} (data: any)`
      )
      .replace(
        'validate.errors = null',
        'const validate: { errors: any } = { errors: null }\n' +
        'validate.errors = null'
      )
  )
})
