/* eslint-disable no-constant-condition */
export function validateEnvironment(data: any) {
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
        if (data.name === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.name', message: 'is required' })
          missing++
        }
        if (data.origins === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.origins', message: 'is required' })
          missing++
        }
      }
      if (missing === 0) {
        var keys1 = Object.keys(data)
        for (var i = 0; i < keys1.length; i++) {
          if (keys1[i] !== 'id' && keys1[i] !== 'name' && keys1[i] !== 'origins') {
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
            if (data.id.length > 60) {
              errors++
              if (validate.errors === null) validate.errors = []
              validate.errors.push({ field: 'data.id', message: 'has longer length than allowed' })
            }
          }
        }
        if (data.name !== undefined) {
          if (!(typeof data.name === 'string')) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.name', message: 'is the wrong type' })
          } else {
            if (data.name.length > 100) {
              errors++
              if (validate.errors === null) validate.errors = []
              validate.errors.push({
                field: 'data.name',
                message: 'has longer length than allowed'
              })
            }
          }
        }
        if (data.origins !== undefined) {
          if (!Array.isArray(data.origins)) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.origins', message: 'is the wrong type' })
          } else {
            for (var j = 0; j < data.origins.length; j++) {
              if (data.origins[j] !== undefined) {
                if (!(typeof data.origins[j] === 'string')) {
                  errors++
                  if (validate.errors === null) validate.errors = []
                  validate.errors.push({
                    field: 'data.origins.' + j + '',
                    message: 'is the wrong type'
                  })
                } else {
                  if (data.origins[j].length > 100) {
                    errors++
                    if (validate.errors === null) validate.errors = []
                    validate.errors.push({
                      field: 'data.origins.' + j + '',
                      message: 'has longer length than allowed'
                    })
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return errors === 0
}
