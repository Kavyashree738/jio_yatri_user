// const Shipment = require('../models/Shipment');
// const Driver = require('../models/Driver');
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const mongoose=require('mongoose')
// const rzp = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// exports.initiatePayment = async (req, res) => {
//   console.log('Initiate payment request received');
//   console.log('Headers:', req.headers);
//   console.log('Params:', req.params);

//   try {
//     const shipment = await Shipment.findById(req.params.id);
//     if (!shipment) {
//       console.log('Shipment not found');
//       return res.status(404).json({ error: 'Shipment not found' });
//     }

//     console.log('Found shipment:', {
//       id: shipment._id,
//       status: shipment.status,
//       payment: shipment.payment
//     });

//     if (shipment.status !== 'delivered') {
//       console.log('Shipment not in delivered state');
//       return res.status(400).json({ error: 'Shipment not available for payment' });
//     }

//     if (shipment.payment.status !== 'pending') {
//       console.log('Payment already processed:', shipment.payment.status);
//       return res.status(400).json({ error: 'Payment already processed' });
//     }

//     console.log('Creating Razorpay order for amount:', shipment.cost * 100);
//     const order = await rzp.orders.create({
//       amount: shipment.cost * 100,
//       currency: 'INR',
//       receipt: `shipment_${shipment.trackingNumber}`,
//     });

//     console.log('Order created:', order);

//     shipment.payment = {
//       method: 'razorpay',
//       status: 'pending',
//       razorpayOrderId: order.id
//     };

//     await shipment.save();
//     console.log('Shipment updated with payment details');

//     res.json(order);
//   } catch (err) {
//     console.error('Error in initiatePayment:', {
//       message: err.message,
//       stack: err.stack,
//       response: err.response?.data
//     });
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

//   try {
//     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generatedSignature = hmac.digest('hex');

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ error: 'Invalid payment signature' });
//     }

//     const shipment = await Shipment.findOne({
//       _id: req.body.shipmentId,
//       'payment.razorpayOrderId': razorpay_order_id
//     });

//     if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

//     shipment.payment = {
//       method: 'razorpay',
//       status: 'paid',
//       razorpayPaymentId: razorpay_payment_id,
//       razorpaySignature: razorpay_signature,
//       collectedAt: new Date()
//     };

//     shipment.paymentHistory.push({
//       amount: shipment.cost,
//       method: 'razorpay',
//       transactionId: razorpay_payment_id,
//       recordedBy: shipment.userId
//     });

//     await shipment.save();

//     // Update driver if assigned
//     if (shipment.assignedDriver?.driverId) {
//       await Driver.findByIdAndUpdate(shipment.assignedDriver.driverId, {
//         $inc: {
//           'earnings': shipment.cost,
//           'paymentBreakdown.online': shipment.cost
//         }
//       });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// exports.markCashPaid = async (req, res) => {
//   try {
//     console.log('🚚 Starting cash payment for shipment:', req.params.id);

//     // 1. Find shipment with all necessary fields
//     const shipment = await Shipment.findById(req.params.id);
//     if (!shipment) {
//       console.log('❌ Shipment not found');
//       return res.status(404).json({ error: 'Shipment not found' });
//     }

//     // 2. Validate shipment status
//     if (shipment.status !== 'delivered') {
//       return res.status(400).json({ error: 'Shipment must be delivered first' });
//     }

//     // 3. Validate payment status
//     if (shipment.payment?.status !== 'pending') {
//       return res.status(400).json({ error: 'Payment already processed' });
//     }

//     // 4. DEBUG: Log complete assignedDriver structure
//     console.log('🔍 AssignedDriver inspection:', {
//       isObject: typeof shipment.assignedDriver === 'object',
//       isMongooseDoc: shipment.assignedDriver instanceof mongoose.Document,
//       rawData: shipment.assignedDriver,
//       stringified: JSON.parse(JSON.stringify(shipment.assignedDriver)),
//       idFields: {
//         _id: shipment.assignedDriver?._id,
//         driverId: shipment.assignedDriver?.driverId,
//         id: shipment.assignedDriver?.id
//       }
//     });

//     // 5. ULTIMATE FIX: Proper driver ID extraction
//     let driverId;
//     if (shipment.assignedDriver) {
//       // Handle both Mongoose subdocuments and plain objects
//       const driverObj = shipment.assignedDriver.toObject 
//         ? shipment.assignedDriver.toObject() 
//         : shipment.assignedDriver;

//       driverId = driverObj._id || driverObj.driverId || driverObj.id;
//     }

//     console.log('✅ Extracted driverId:', driverId);

//     if (!driverId) {
//       console.error('❌ No valid driver ID found in:', shipment.assignedDriver);
//       return res.status(400).json({ 
//         error: 'Invalid driver assignment',
//         details: {
//           problem: 'Could not resolve driver reference',
//           received: shipment.assignedDriver
//         }
//       })
//     }

//     // 6. Verify driver exists
//     const driver = await Driver.findById(driverId);
//     if (!driver) {
//       console.error('❌ Driver not found:', driverId);
//       return res.status(404).json({ error: 'Driver not found' });
//     }

//     // 7. Update payment status
//     shipment.payment = {
//       method: 'cash',
//       status: 'paid',
//       collectedAt: new Date(),
//       collectedBy: driverId
//     };

//     // 8. Update driver earnings
//     driver.earnings = Number(driver.earnings) + Number(shipment.cost);
//     driver.paymentBreakdown.cash = Number(driver.paymentBreakdown.cash) + Number(shipment.cost);
//     driver.collectedPayments.push({
//       shipment: shipment._id,
//       amount: shipment.cost,
//       method: 'cash',
//       collectedAt: new Date()
//     });


//     // 9. Save changes
//     await Promise.all([shipment.save(), driver.save()]);
//     console.log('💰 Payment processed successfully');

//     return res.json({ 
//       success: true,
//       payment: shipment.payment,
//       driverEarnings: driver.earnings
//     });

//   } catch (err) {
//     console.error('🔥 Payment error:', {
//       message: err.message,
//       stack: err.stack,
//       shipmentId: req.params.id
//     });
//     return res.status(500).json({ 
//       error: 'Payment processing failed',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };


// const Shipment = require('../models/Shipment');
// const Driver = require('../models/Driver');
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const mongoose = require('mongoose');

// const rzp = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// exports.initiatePayment = async (req, res) => {
//   try {
//     const shipment = await Shipment.findById(req.params.id);
//     if (!shipment) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Shipment not found' 
//       });
//     }

//     if (shipment.status !== 'delivered') {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Shipment must be delivered before payment' 
//       });
//     }

//     if (shipment.payment?.status !== 'pending') {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Payment already processed' 
//       });
//     }

//     const order = await rzp.orders.create({
//       amount: shipment.cost * 100,
//       currency: 'INR',
//       receipt: `shipment_${shipment.trackingNumber}`,
//     });

//     shipment.payment = {
//       method: 'razorpay',
//       status: 'pending',
//       razorpayOrderId: order.id
//     };

//     await shipment.save();

//     res.json({
//       success: true,
//       data: order
//     });
//   } catch (err) {
//     console.error('Payment initiation error:', {
//       error: err,
//       shipmentId: req.params.id,
//       timestamp: new Date()
//     });
//     res.status(500).json({ 
//       success: false,
//       error: 'Payment initiation failed',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature, shipmentId } = req.body;

//   if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !shipmentId) {
//     return res.status(400).json({ 
//       success: false,
//       error: 'Missing required payment verification fields' 
//     });
//   }

//   try {
//     // Verify signature
//     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generatedSignature = hmac.digest('hex');

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Invalid payment signature' 
//       });
//     }

//     // Find shipment
//     const shipment = await Shipment.findOne({
//       _id: shipmentId,
//       'payment.razorpayOrderId': razorpay_order_id
//     });

//     if (!shipment) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Matching shipment not found' 
//       });
//     }

//     // Update payment status
//     shipment.payment = {
//       method: 'razorpay',
//       status: 'paid',
//       razorpayPaymentId: razorpay_payment_id,
//       razorpaySignature: razorpay_signature,
//       collectedAt: new Date()
//     };

//     // Add to payment history
//     shipment.paymentHistory.push({
//       amount: shipment.cost,
//       method: 'razorpay',
//       transactionId: razorpay_payment_id,
//       recordedBy: req.user?.id || 'system'
//     });

//     await shipment.save();

//     // Update driver earnings if applicable
//     if (shipment.assignedDriver?.driverId) {
//       await Driver.findByIdAndUpdate(shipment.assignedDriver.driverId, {
//         $inc: {
//           earnings: shipment.cost,
//           'paymentBreakdown.online': shipment.cost
//         },
//         $push: {
//           collectedPayments: {
//             shipment: shipment._id,
//             amount: shipment.cost,
//             method: 'razorpay',
//             collectedAt: new Date()
//           }
//         }
//       });
//     }

//     res.json({ 
//       success: true,
//       message: 'Payment verified and recorded successfully'
//     });

//   } catch (err) {
//     console.error('Payment verification error:', {
//       error: err,
//       requestBody: req.body,
//       timestamp: new Date()
//     });
//     res.status(500).json({ 
//       success: false,
//       error: 'Payment verification failed',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// exports.markCashPaid = async (req, res) => {
//   try {
//     const shipment = await Shipment.findById(req.params.id);
//     if (!shipment) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'Shipment not found' 
//       });
//     }

//     if (shipment.status !== 'delivered') {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Shipment must be delivered first' 
//       });
//     }

//     if (shipment.payment?.status !== 'pending') {
//       return res.status(400).json({ 
//         success: false,
//         error: 'Payment already processed' 
//       });
//     }

//     const driverId = shipment.assignedDriver?.driverId || 
//                     shipment.assignedDriver?._id;

//     if (!driverId) {
//       return res.status(400).json({ 
//         success: false,
//         error: 'No valid driver assigned' 
//       });
//     }

//     // Update shipment payment status
//     shipment.payment = {
//       method: 'cash',
//       status: 'paid',
//       collectedAt: new Date(),
//       collectedBy: driverId
//     };

//     // Update driver earnings
//     await Driver.findByIdAndUpdate(driverId, {
//       $inc: {
//         earnings: shipment.cost,
//         'paymentBreakdown.cash': shipment.cost
//       },
//       $push: {
//         collectedPayments: {
//           shipment: shipment._id,
//           amount: shipment.cost,
//           method: 'cash',
//           collectedAt: new Date()
//         }
//       }
//     });

//     await shipment.save();

//     return res.json({ 
//       success: true,
//       message: 'Cash payment recorded successfully'
//     });

//   } catch (err) {
//     console.error('Cash payment error:', {
//       error: err,
//       shipmentId: req.params.id,
//       timestamp: new Date()
//     });
//     return res.status(500).json({ 
//       success: false,
//       error: 'Cash payment processing failed',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

const Shipment = require('../models/Shipment');
const Driver = require('../models/Driver');
const Razorpay = require('razorpay');
const crypto = require('crypto');const mongoose = require('mongoose');

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('Razorpay initialized with key:', process.env.RAZORPAY_KEY_ID ? '***REDACTED***' : 'MISSING');

exports.initiatePayment = async (req, res) => {
  console.log('\n=== INITIATE PAYMENT STARTED ===');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);

  try {
    // 1. Validate environment variables
    console.log('\n[1/7] Checking Razorpay credentials...');
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      const error = new Error('Razorpay credentials not configured');
      console.error('❌ Environment variables missing:');
      console.error('- RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '***REDACTED***' : 'MISSING');
      console.error('- RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '***REDACTED***' : 'MISSING');
      throw error;
    }
    console.log('✅ Razorpay credentials verified');

    // 2. Find shipment
    console.log('\n[2/7] Looking up shipment:', req.params.id);
    const shipment = await Shipment.findById(req.params.id).lean();
    console.log('Shipment found:', shipment ? shipment._id : 'NOT FOUND');

    if (!shipment) {
      console.log('❌ Shipment not found');
      return res.status(404).json({ 
        success: false,
        error: 'Shipment not found' 
      });
    }

    // 3. Validate shipment cost
    console.log('\n[3/7] Validating shipment cost...');
    console.log('Current cost:', shipment.cost);
    if (!shipment.cost || isNaN(shipment.cost)) {
      console.log('❌ Cost is not a number');
      return res.status(400).json({ 
        success: false,
        error: 'Shipment cost must be a number' 
      });
    }
    if (shipment.cost <= 0) {
      console.log('❌ Invalid cost amount (must be > 0)');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid shipment cost' 
      });
    }
    console.log('✅ Cost validation passed');

    // 4. Prepare order options
    console.log('\n[4/7] Preparing order options...');
    const orderAmount = Math.round(shipment.cost * 100);
    const receiptId = shipment.trackingNumber || `temp_${Date.now()}`;
    
    const orderOptions = {
      amount: orderAmount,
      currency: 'INR',
      receipt: `shipment_${receiptId}`,
      payment_capture: 1,
      notes: {
        shipmentId: shipment._id.toString(),
        internalReference: 'your-custom-reference' // Add your own reference here
      }
    };
    console.log('Order options:', {
      ...orderOptions,
      notes: orderOptions.notes // Log notes separately for clarity
    });

    // 5. Create Razorpay order
    console.log('\n[5/7] Creating Razorpay order...');
    let order;
    try {
      order = await rzp.orders.create(orderOptions);
      console.log('✅ Order created successfully:', {
        id: order.id,
        amount: order.amount,
        status: order.status
      });
    } catch (rzpError) {
      console.error('❌ Razorpay order creation failed:');
      console.error('- Error:', rzpError.error ? rzpError.error : rzpError);
      console.error('- Status Code:', rzpError.statusCode);
      console.error('- Description:', rzpError.description);
      throw new Error(`Razorpay order creation failed: ${rzpError.error?.description || rzpError.message}`);
    }

    // 6. Update shipment record
    console.log('\n[6/7] Updating shipment record...');
    const updateResult = await Shipment.updateOne(
      { _id: shipment._id },
      { 
        $set: { 
          'payment.razorpayOrderId': order.id,
          'payment.status': 'pending',
          'payment.amount': shipment.cost,
          'payment.currency': 'INR',
          'payment.initiatedAt': new Date()
        } 
      }
    );
    console.log('Update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount
    });

    if (updateResult.matchedCount === 0) {
      console.log('❌ Shipment update failed - no document matched');
      throw new Error('Failed to update shipment record');
    }

    // 7. Return success response
    console.log('\n[7/7] Returning success response');
    const response = {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      key: process.env.RAZORPAY_KEY_ID,
      shipmentId: shipment._id
    };
    console.log('Response payload:', response);

    return res.json(response);

  } catch (error) {
    console.error('\n!!! PAYMENT INITIATION ERROR !!!');
    console.error('Error:', error.message);
    
    if (error.error) {
      console.error('Razorpay Error Details:', {
        code: error.error.code,
        description: error.error.description,
        field: error.error.field
      });
    }
    
    console.error('Stack Trace:', error.stack);
    console.error('Error occurred at:', new Date().toISOString());

    return res.status(500).json({ 
      success: false,
      error: 'Payment initiation failed',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        ...(error.error && { razorpayError: error.error })
      } : undefined
    });
  } finally {
    console.log('\n=== INITIATE PAYMENT COMPLETED ===');
  }
};

exports.verifyPayment = async (req, res) => {
  console.log('\n=== VERIFY PAYMENT STARTED ===');
  console.log('Request body:', req.body);

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, shipmentId } = req.body;

  console.log('Received fields:', {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature: razorpay_signature ? '***REDACTED***' : 'MISSING',
    shipmentId
  });

  // Validation
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !shipmentId) {
    console.log('Missing required fields');
    return res.status(400).json({
      success: false,
      error: 'Missing required payment verification fields',
      missingFields: {
        razorpay_payment_id: !razorpay_payment_id,
        razorpay_order_id: !razorpay_order_id,
        razorpay_signature: !razorpay_signature,
        shipmentId: !shipmentId
      }
    });
  }

  try {
    // Signature Verification
    console.log('Verifying signature...');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    console.log('Signature comparison:', {
      received: razorpay_signature,
      generated: generatedSignature,
      match: generatedSignature === razorpay_signature
    });

    if (generatedSignature !== razorpay_signature) {
      console.log('Signature mismatch');
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Find Shipment
    console.log('Looking for shipment:', shipmentId);
    const shipment = await Shipment.findOne({
      _id: shipmentId,
      'payment.razorpayOrderId': razorpay_order_id
    });

    console.log('Found shipment:', shipment ? shipment._id : 'NOT FOUND');

    if (!shipment) {
      console.log('Shipment not found or order ID mismatch');
      return res.status(404).json({
        success: false,
        error: 'Matching shipment not found',
        details: {
          searchedId: shipmentId,
          orderId: razorpay_order_id
        }
      });
    }

    // Update Payment
    console.log('Updating shipment payment status');
    shipment.payment = {
      method: 'razorpay',
      status: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      collectedAt: new Date()
    };

    // Add to payment history
    const recordedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;

    shipment.paymentHistory.push({
      amount: shipment.cost,
      method: 'razorpay',
      transactionId: razorpay_payment_id,
      ...(recordedBy && { recordedBy }) // Only add if valid ObjectId
    });


    await shipment.save();
    console.log('Shipment payment updated successfully');

    // Update Driver Earnings
    if (shipment.assignedDriver?.driverId) {
      console.log('Updating driver earnings for driver:', shipment.assignedDriver.driverId);
      await Driver.findByIdAndUpdate(shipment.assignedDriver.driverId, {
        $inc: {
          earnings: shipment.cost,
          'paymentBreakdown.online': shipment.cost
        },
        $push: {
          collectedPayments: {
            shipment: shipment._id,
            amount: shipment.cost,
            method: 'razorpay',
            collectedAt: new Date()
          }
        }
      });
      console.log('Driver earnings updated');
    }

    res.json({
      success: true,
      message: 'Payment verified and recorded successfully'
    });

  } catch (err) {
    console.error('\n!!! PAYMENT VERIFICATION ERROR !!!');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Verification details:', {
      requestBody: req.body,
      timestamp: new Date()
    });

    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    console.log('=== VERIFY PAYMENT COMPLETED ===\n');
  }
};

exports.markCashPaid = async (req, res) => {
  try {
    console.log('\n=== CASH PAYMENT INITIATED ===');

    const shipment = await Shipment.findById(req.params.id);
    console.log('[CASH] Shipment fetched:', shipment);

    if (!shipment) {
      console.log('[CASH] Shipment not found');
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    console.log('[CASH] Shipment status:', shipment.status);
    if (shipment.status !== 'delivered') {
      console.log('[CASH] Shipment not yet delivered');
      return res.status(400).json({
        success: false,
        error: 'Shipment must be delivered first'
      });
    }

    console.log('[CASH] Payment status:', shipment.payment?.status);
    if (shipment.payment?.status !== 'pending') {
      console.log('[CASH] Payment already processed');
      return res.status(400).json({
        success: false,
        error: 'Payment already processed'
      });
    }

    // ✅ Use .toObject() to extract driverId safely
    const shipmentObj = shipment.toObject();
    const driverId = shipmentObj.assignedDriver && shipmentObj.assignedDriver._id;
    console.log('[CASH] Driver ID:', driverId);

    if (!driverId) {
      console.log('[CASH] No valid driver assigned');
      return res.status(400).json({
        success: false,
        error: 'No valid driver assigned'
      });
    }

    // ✅ Update shipment payment
    shipment.payment = {
      method: 'cash',
      status: 'paid',
      collectedAt: new Date(),
      collectedBy: driverId
    };
    console.log('[CASH] Shipment payment updated');

    // ✅ Add to shipment's payment history
    shipment.paymentHistory.push({
      amount: shipment.cost,
      method: 'cash',
      transactionId: `cash-${Date.now()}`,
      recordedBy: driverId,
      collectedAt: new Date()
    });
    console.log('[CASH] Shipment payment history updated');

    // ✅ Update driver earnings
    await Driver.findByIdAndUpdate(driverId, {
      $inc: {
        earnings: shipment.cost,
        'paymentBreakdown.cash': shipment.cost
      },
      $push: {
        collectedPayments: {
          shipment: shipment._id,
          amount: shipment.cost,
          method: 'cash',
          collectedAt: new Date()
        }
      }
    });
    console.log('[CASH] Driver earnings updated');

    await shipment.save();
    console.log('[CASH] Shipment saved successfully');

    return res.json({
      success: true,
      message: 'Cash payment recorded successfully'
    });

  } catch (err) {
    console.error('[CASH] Error during cash payment:', err);
    return res.status(500).json({
      success: false,
      error: 'Cash payment processing failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    console.log('=== CASH PAYMENT PROCESS COMPLETED ===\n');
  }
};
