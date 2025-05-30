const { body } = require('express-validator');

exports.validateUserCreate = [
  body('uid').notEmpty().withMessage('UID is required'),
  body('provider').notEmpty().withMessage('Provider is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number required')
];

exports.validateCredentialsUpdate = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .not().isIn(['123456', 'password', 'qwerty']).withMessage('Do not use common passwords')
];

const Joi = require('joi');

exports.validateShipment = (req, res, next) => {
  const addressSchema = Joi.object({
    addressLine1: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
    lat: Joi.number().required(),
    lng: Joi.number().required()
  });

  const userSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required()
  });

  const schema = Joi.object({
    sender: userSchema.required(),
    receiver: userSchema.required(),
    senderAddress: addressSchema.required(),
    receiverAddress: addressSchema.required(),
    vehicleType: Joi.string().valid('bicycle', 'car', 'van').required(),
    distance: Joi.number().positive().required(),
    cost: Joi.number().positive().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details.map(d => d.message) 
    });
  }

  next();
};