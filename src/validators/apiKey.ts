/* eslint-disable no-constant-condition */
export function validateApiKey(data: any) {
  if (data === undefined) data = null
  const validate: { errors: any } = { errors: null }
  validate.errors = null
  var errors = 0
  if (data !== undefined) {
    if (!(typeof data === 'object' && data && !Array.isArray(data))) {
      errors++
      if (validate.errors === null) validate.errors = []
      validate.errors.push({ field: 'data', message: 'is the wrong type' })
    } else {
      if (true) {
        var missing = 0
        if (data.id === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.id', message: 'is required' })
          missing++
        }
        if (data.key === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.key', message: 'is required' })
          missing++
        }
        if (data.created_at === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.created_at', message: 'is required' })
          missing++
        }
        if (data.created_by === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.created_by', message: 'is required' })
          missing++
        }
      }
      if (missing === 0) {
        var keys1 = Object.keys(data)
        for (var i = 0; i < keys1.length; i++) {
          if (
            keys1[i] !== 'id' &&
            keys1[i] !== 'key' &&
            keys1[i] !== 'created_by' &&
            keys1[i] !== 'created_at' &&
            keys1[i] !== 'last_used'
          ) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data', message: 'has additional properties' })
          }
        }
        if (data.id !== undefined) {
          if (!(typeof data.id === 'string')) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.id', message: 'is the wrong type' })
          } else {
          }
        }
        if (data.key !== undefined) {
          if (!(typeof data.key === 'string')) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.key', message: 'is the wrong type' })
          } else {
          }
        }
        if (data.created_by !== undefined) {
          if (!(typeof data.created_by === 'string')) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.created_by', message: 'is the wrong type' })
          } else {
          }
        }
        if (data.created_at !== undefined) {
          if (!(typeof data.created_at === 'string')) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.created_at', message: 'is the wrong type' })
          } else {
          }
        }
        if (data.last_used !== undefined) {
          if (!(typeof data.last_used === 'string' || data.last_used === null)) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.last_used', message: 'is the wrong type' })
          } else {
          }
        }
      }
    }
  }
  return errors === 0
}
