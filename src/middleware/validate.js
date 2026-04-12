/**
 * Joi Validation Middleware Factory
 * Creates middleware that validates request body, query, or params against a Joi schema.
 * 
 * @param {Object} schema - Joi schema object with optional body, query, params keys
 * @returns {Function} Express middleware
 */
export function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    // Validate request body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        errors.push(...error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message.replace(/"/g, ''),
          location: 'body',
        })));
      } else {
        req.body = value;
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        errors.push(...error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message.replace(/"/g, ''),
          location: 'query',
        })));
      } else {
        req.query = value;
      }
    }

    // Validate URL parameters
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        errors.push(...error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message.replace(/"/g, ''),
          location: 'params',
        })));
      } else {
        req.params = value;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        details: errors,
      });
    }

    next();
  };
}
