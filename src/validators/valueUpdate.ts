/* eslint-disable no-constant-condition */
export function validateValueUpdate(data: any) {
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
        if (data.environment === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.environment', message: 'is required' })
          missing++
        }
        if (data.namespace === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.namespace', message: 'is required' })
          missing++
        }
        if (data.id === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.id', message: 'is required' })
          missing++
        }
        if (data.value === undefined) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data.value', message: 'is required' })
          missing++
        }
      }
      if (missing === 0) {
        var keys1 = Object.keys(data)
        for (var i = 0; i < keys1.length; i++) {
          if (
            keys1[i] !== 'environment' &&
            keys1[i] !== 'namespace' &&
            keys1[i] !== 'id' &&
            keys1[i] !== 'value'
          ) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data', message: 'has additional properties' })
          }
        }
        var prev1 = errors
        var passes1 = 0
        if (data !== undefined) {
          if (data.value !== undefined) {
            if (!(typeof data.value === 'string')) {
              errors++
            } else {
              if (data.value.length > 100) {
                errors++
              }
            }
          }
        }
        if (prev1 === errors) {
          passes1++
        } else {
          errors = prev1
        }
        if (data !== undefined) {
          if (data.value !== undefined) {
            if (!(typeof data.value === 'object' && data.value && !Array.isArray(data.value))) {
              errors++
            } else {
              if (data.value.label !== undefined) {
                if (!(typeof data.value.label === 'string')) {
                  errors++
                } else {
                  if (data.value.label.length > 60) {
                    errors++
                  }
                }
              }
              if (data.value.value !== undefined) {
                if (!(typeof data.value.value === 'string')) {
                  errors++
                } else {
                  if (data.value.value.length > 100) {
                    errors++
                  }
                }
              }
            }
          }
        }
        if (prev1 === errors) {
          passes1++
        } else {
          errors = prev1
        }
        if (data !== undefined) {
          if (data.value !== undefined) {
            if (
              !(
                (typeof data.value === 'number' && isFinite(data.value)) ||
                typeof data.value === 'boolean' ||
                data.value === null
              )
            ) {
              errors++
            } else {
            }
          }
        }
        if (prev1 === errors) {
          passes1++
        } else {
          errors = prev1
        }
        if (passes1 !== 1) {
          errors++
          if (validate.errors === null) validate.errors = []
          validate.errors.push({ field: 'data', message: 'no (or more than one) schemas match' })
        }
        if (data.environment !== undefined) {
          if (!(typeof data.environment === 'string')) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.environment', message: 'is the wrong type' })
          } else {
            if (data.environment.length > 60) {
              errors++
              if (validate.errors === null) validate.errors = []
              validate.errors.push({
                field: 'data.environment',
                message: 'has longer length than allowed'
              })
            }
          }
        }
        if (data.namespace !== undefined) {
          if (!(typeof data.namespace === 'string')) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.namespace', message: 'is the wrong type' })
          } else {
            if (data.namespace.length > 60) {
              errors++
              if (validate.errors === null) validate.errors = []
              validate.errors.push({
                field: 'data.namespace',
                message: 'has longer length than allowed'
              })
            }
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
        if (data.value !== undefined) {
          if (
            !(
              typeof data.value === 'string' ||
              (typeof data.value === 'number' && isFinite(data.value)) ||
              typeof data.value === 'boolean' ||
              data.value === null ||
              (typeof data.value === 'object' && data.value && !Array.isArray(data.value))
            )
          ) {
            errors++
            if (validate.errors === null) validate.errors = []
            validate.errors.push({ field: 'data.value', message: 'is the wrong type' })
          } else {
          }
        }
      }
    }
  }
  return errors === 0
}
