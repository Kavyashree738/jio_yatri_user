// // const Shipment = require('../models/Shipment');
// // const Driver = require('../models/Driver');
// // const Razorpay = require('razorpay');
// // const crypto = require('crypto');
// // const mongoose=require('mongoose')
// // const rzp = new Razorpay({
// //   key_id: process.env.RAZORPAY_KEY_ID,
// //   key_secret: process.env.RAZORPAY_KEY_SECRET
// // });

// // exports.initiatePayment = async (req, res) => {
// //   console.log('Initiate payment request received');
// //   console.log('Headers:', req.headers);
// //   console.log('Params:', req.params);

// //   try {
// //     const shipment = await Shipment.findById(req.params.id);
// //     if (!shipment) {
// //       console.log('Shipment not found');
// //       return res.status(404).json({ error: 'Shipment not found' });
// //     }

// //     console.log('Found shipment:', {
// //       id: shipment._id,
// //       status: shipment.status,
// //       payment: shipment.payment
// //     });

// //     if (shipment.status !== 'delivered') {
// //       console.log('Shipment not in delivered state');
// //       return res.status(400).json({ error: 'Shipment not available for payment' });
// //     }

// //     if (shipment.payment.status !== 'pending') {
// //       console.log('Payment already processed:', shipment.payment.status);
// //       return res.status(400).json({ error: 'Payment already processed' });
// //     }

// //     console.log('Creating Razorpay order for amount:', shipment.cost * 100);
// //     const order = await rzp.orders.create({
// //       amount: shipment.cost * 100,
// //       currency: 'INR',
// //       receipt: `shipment_${shipment.trackingNumber}`,
// //     });

// //     console.log('Order created:', order);

// //     shipment.payment = {
// //       method: 'razorpay',
// //       status: 'pending',
// //       razorpayOrderId: order.id
// //     };

// //     await shipment.save();
// //     console.log('Shipment updated with payment details');

// //     res.json(order);
// //   } catch (err) {
// //     console.error('Error in initiatePayment:', {
// //       message: err.message,
// //       stack: err.stack,
// //       response: err.response?.data
// //     });
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // exports.verifyPayment = async (req, res) => {
// //   const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

// //   try {
// //     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
// //     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
// //     const generatedSignature = hmac.digest('hex');

// //     if (generatedSignature !== razorpay_signature) {
// //       return res.status(400).json({ error: 'Invalid payment signature' });
// //     }

// //     const shipment = await Shipment.findOne({
// //       _id: req.body.shipmentId,
// //       'payment.razorpayOrderId': razorpay_order_id
// //     });

// //     if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

// //     shipment.payment = {
// //       method: 'razorpay',
// //       status: 'paid',
// //       razorpayPaymentId: razorpay_payment_id,
// //       razorpaySignature: razorpay_signature,
// //       collectedAt: new Date()
// //     };

// //     shipment.paymentHistory.push({
// //       amount: shipment.cost,
// //       method: 'razorpay',
// //       transactionId: razorpay_payment_id,
// //       recordedBy: shipment.userId
// //     });

// //     await shipment.save();

// //     // Update driver if assigned
// //     if (shipment.assignedDriver?.driverId) {
// //       await Driver.findByIdAndUpdate(shipment.assignedDriver.driverId, {
// //         $inc: {
// //           'earnings': shipment.cost,
// //           'paymentBreakdown.online': shipment.cost
// //         }
// //       });
// //     }

// //     res.json({ success: true });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };


// // exports.markCashPaid = async (req, res) => {
// //   try {
// //     console.log('🚚 Starting cash payment for shipment:', req.params.id);

// //     // 1. Find shipment with all necessary fields
// //     const shipment = await Shipment.findById(req.params.id);
// //     if (!shipment) {
// //       console.log('❌ Shipment not found');
// //       return res.status(404).json({ error: 'Shipment not found' });
// //     }

// //     // 2. Validate shipment status
// //     if (shipment.status !== 'delivered') {
// //       return res.status(400).json({ error: 'Shipment must be delivered first' });
// //     }

// //     // 3. Validate payment status
// //     if (shipment.payment?.status !== 'pending') {
// //       return res.status(400).json({ error: 'Payment already processed' });
// //     }

// //     // 4. DEBUG: Log complete assignedDriver structure
// //     console.log('🔍 AssignedDriver inspection:', {
// //       isObject: typeof shipment.assignedDriver === 'object',
// //       isMongooseDoc: shipment.assignedDriver instanceof mongoose.Document,
// //       rawData: shipment.assignedDriver,
// //       stringified: JSON.parse(JSON.stringify(shipment.assignedDriver)),
// //       idFields: {
// //         _id: shipment.assignedDriver?._id,
// //         driverId: shipment.assignedDriver?.driverId,
// //         id: shipment.assignedDriver?.id
// //       }
// //     });

// //     // 5. ULTIMATE FIX: Proper driver ID extraction
// //     let driverId;
// //     if (shipment.assignedDriver) {
// //       // Handle both Mongoose subdocuments and plain objects
// //       const driverObj = shipment.assignedDriver.toObject 
// //         ? shipment.assignedDriver.toObject() 
// //         : shipment.assignedDriver;

// //       driverId = driverObj._id || driverObj.driverId || driverObj.id;
// //     }

// //     console.log('✅ Extracted driverId:', driverId);

// //     if (!driverId) {
// //       console.error('❌ No valid driver ID found in:', shipment.assignedDriver);
// //       return res.status(400).json({ 
// //         error: 'Invalid driver assignment',
// //         details: {
// //           problem: 'Could not resolve driver reference',
// //           received: shipment.assignedDriver
// //         }
// //       })
// //     }

// //     // 6. Verify driver exists
// //     const driver = await Driver.findById(driverId);
// //     if (!driver) {
// //       console.error('❌ Driver not found:', driverId);
// //       return res.status(404).json({ error: 'Driver not found' });
// //     }

// //     // 7. Update payment status
// //     shipment.payment = {
// //       method: 'cash',
// //       status: 'paid',
// //       collectedAt: new Date(),
// //       collectedBy: driverId
// //     };

// //     // 8. Update driver earnings
// //     driver.earnings = Number(driver.earnings) + Number(shipment.cost);
// //     driver.paymentBreakdown.cash = Number(driver.paymentBreakdown.cash) + Number(shipment.cost);
// //     driver.collectedPayments.push({
// //       shipment: shipment._id,
// //       amount: shipment.cost,
// //       method: 'cash',
// //       collectedAt: new Date()
// //     });


// //     // 9. Save changes
// //     await Promise.all([shipment.save(), driver.save()]);
// //     console.log('💰 Payment processed successfully');

// //     return res.json({ 
// //       success: true,
// //       payment: shipment.payment,
// //       driverEarnings: driver.earnings
// //     });

// //   } catch (err) {
// //     console.error('🔥 Payment error:', {
// //       message: err.message,
// //       stack: err.stack,
// //       shipmentId: req.params.id
// //     });
// //     return res.status(500).json({ 
// //       error: 'Payment processing failed',
// //       details: process.env.NODE_ENV === 'development' ? err.message : undefined
// //     });
// //   }
// // };


// // const Shipment = require('../models/Shipment');
// // const Driver = require('../models/Driver');
// // const Razorpay = require('razorpay');
// // const crypto = require('crypto');
// // const mongoose = require('mongoose');

// // const rzp = new Razorpay({
// //   key_id: process.env.RAZORPAY_KEY_ID,
// //   key_secret: process.env.RAZORPAY_KEY_SECRET
// // });

// // exports.initiatePayment = async (req, res) => {
// //   try {
// //     const shipment = await Shipment.findById(req.params.id);
// //     if (!shipment) {
// //       return res.status(404).json({ 
// //         success: false,
// //         error: 'Shipment not found' 
// //       });
// //     }

// //     if (shipment.status !== 'delivered') {
// //       return res.status(400).json({ 
// //         success: false,
// //         error: 'Shipment must be delivered before payment' 
// //       });
// //     }

// //     if (shipment.payment?.status !== 'pending') {
// //       return res.status(400).json({ 
// //         success: false,
// //         error: 'Payment already processed' 
// //       });
// //     }

// //     const order = await rzp.orders.create({
// //       amount: shipment.cost * 100,
// //       currency: 'INR',
// //       receipt: `shipment_${shipment.trackingNumber}`,
// //     });

// //     shipment.payment = {
// //       method: 'razorpay',
// //       status: 'pending',
// //       razorpayOrderId: order.id
// //     };

// //     await shipment.save();

// //     res.json({
// //       success: true,
// //       data: order
// //     });
// //   } catch (err) {
// //     console.error('Payment initiation error:', {
// //       error: err,
// //       shipmentId: req.params.id,
// //       timestamp: new Date()
// //     });
// //     res.status(500).json({ 
// //       success: false,
// //       error: 'Payment initiation failed',
// //       details: process.env.NODE_ENV === 'development' ? err.message : undefined
// //     });
// //   }
// // };

// // exports.verifyPayment = async (req, res) => {
// //   const { razorpay_payment_id, razorpay_order_id, razorpay_signature, shipmentId } = req.body;

// //   if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !shipmentId) {
// //     return res.status(400).json({ 
// //       success: false,
// //       error: 'Missing required payment verification fields' 
// //     });
// //   }

// //   try {
// //     // Verify signature
// //     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
// //     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
// //     const generatedSignature = hmac.digest('hex');

// //     if (generatedSignature !== razorpay_signature) {
// //       return res.status(400).json({ 
// //         success: false,
// //         error: 'Invalid payment signature' 
// //       });
// //     }

// //     // Find shipment
// //     const shipment = await Shipment.findOne({
// //       _id: shipmentId,
// //       'payment.razorpayOrderId': razorpay_order_id
// //     });

// //     if (!shipment) {
// //       return res.status(404).json({ 
// //         success: false,
// //         error: 'Matching shipment not found' 
// //       });
// //     }

// //     // Update payment status
// //     shipment.payment = {
// //       method: 'razorpay',
// //       status: 'paid',
// //       razorpayPaymentId: razorpay_payment_id,
// //       razorpaySignature: razorpay_signature,
// //       collectedAt: new Date()
// //     };

// //     // Add to payment history
// //     shipment.paymentHistory.push({
// //       amount: shipment.cost,
// //       method: 'razorpay',
// //       transactionId: razorpay_payment_id,
// //       recordedBy: req.user?.id || 'system'
// //     });

// //     await shipment.save();

// //     // Update driver earnings if applicable
// //     if (shipment.assignedDriver?.driverId) {
// //       await Driver.findByIdAndUpdate(shipment.assignedDriver.driverId, {
// //         $inc: {
// //           earnings: shipment.cost,
// //           'paymentBreakdown.online': shipment.cost
// //         },
// //         $push: {
// //           collectedPayments: {
// //             shipment: shipment._id,
// //             amount: shipment.cost,
// //             method: 'razorpay',
// //             collectedAt: new Date()
// //           }
// //         }
// //       });
// //     }

// //     res.json({ 
// //       success: true,
// //       message: 'Payment verified and recorded successfully'
// //     });

// //   } catch (err) {
// //     console.error('Payment verification error:', {
// //       error: err,
// //       requestBody: req.body,
// //       timestamp: new Date()
// //     });
// //     res.status(500).json({ 
// //       success: false,
// //       error: 'Payment verification failed',
// //       details: process.env.NODE_ENV === 'development' ? err.message : undefined
// //     });
// //   }
// // };

// // exports.markCashPaid = async (req, res) => {
// //   try {
// //     const shipment = await Shipment.findById(req.params.id);
// //     if (!shipment) {
// //       return res.status(404).json({ 
// //         success: false,
// //         error: 'Shipment not found' 
// //       });
// //     }

// //     if (shipment.status !== 'delivered') {
// //       return res.status(400).json({ 
// //         success: false,
// //         error: 'Shipment must be delivered first' 
// //       });
// //     }

// //     if (shipment.payment?.status !== 'pending') {
// //       return res.status(400).json({ 
// //         success: false,
// //         error: 'Payment already processed' 
// //       });
// //     }

// //     const driverId = shipment.assignedDriver?.driverId || 
// //                     shipment.assignedDriver?._id;

// //     if (!driverId) {
// //       return res.status(400).json({ 
// //         success: false,
// //         error: 'No valid driver assigned' 
// //       });
// //     }

// //     // Update shipment payment status
// //     shipment.payment = {
// //       method: 'cash',
// //       status: 'paid',
// //       collectedAt: new Date(),
// //       collectedBy: driverId
// //     };

// //     // Update driver earnings
// //     await Driver.findByIdAndUpdate(driverId, {
// //       $inc: {
// //         earnings: shipment.cost,
// //         'paymentBreakdown.cash': shipment.cost
// //       },
// //       $push: {
// //         collectedPayments: {
// //           shipment: shipment._id,
// //           amount: shipment.cost,
// //           method: 'cash',
// //           collectedAt: new Date()
// //         }
// //       }
// //     });

// //     await shipment.save();

// //     return res.json({ 
// //       success: true,
// //       message: 'Cash payment recorded successfully'
// //     });

// //   } catch (err) {
// //     console.error('Cash payment error:', {
// //       error: err,
// //       shipmentId: req.params.id,
// //       timestamp: new Date()
// //     });
// //     return res.status(500).json({ 
// //       success: false,
// //       error: 'Cash payment processing failed',
// //       details: process.env.NODE_ENV === 'development' ? err.message : undefined
// //     });
// //   }
// // };

// const Shipment = require('../models/Shipment');
// const Driver = require('../models/Driver');
// const Razorpay = require('razorpay');
// const crypto = require('crypto');const mongoose = require('mongoose');

// const rzp = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // console.log('Razorpay initialized with key:', process.env.RAZORPAY_KEY_ID ? '***REDACTED***' : 'MISSING');

// exports.initiatePayment = async (req, res) => {
//   // console.log('\n=== INITIATE PAYMENT STARTED ===');
//   // console.log('Request params:', req.params);
//   // console.log('Request body:', req.body);

//   try {
//     const shipment = await Shipment.findById(req.params.id);
//     // console.log('Found shipment:', shipment ? shipment._id : 'NOT FOUND');

//     if (!shipment) {
//       // console.log('Shipment not found');
//       return res.status(404).json({
//         success: false,
//         error: 'Shipment not found'
//       });
//     }

//     // console.log('Shipment status:', shipment.status);
//     // console.log('Payment status:', shipment.payment?.status);

//     // Updated condition: Allow payment if status is 'pending' OR 'delivered'
//     if (shipment.status !== 'pending' && shipment.status !== 'delivered') {
//       // console.log('Shipment not in a payable state (must be pending or delivered)');
//       return res.status(400).json({
//         success: false,
//         error: 'Payment can only be initiated when shipment is pending or delivered'
//       });
//     }

//     if (shipment.payment?.status !== 'pending') {
//       // console.log('Payment already processed');
//       return res.status(400).json({
//         success: false,
//         error: 'Payment already processed'
//       });
//     }

//     const orderAmount = Math.round(shipment.cost * 100);
//     // console.log('Creating order for amount:', orderAmount);

//     const order = await rzp.orders.create({
//       amount: orderAmount,
//       currency: 'INR',
//       receipt: `shipment_${shipment.trackingNumber}`,
//       payment_capture: 1 // Auto-capture payment
//     });

//     // console.log('Razorpay order created:', order.id);

//     shipment.payment = {
//       method: 'razorpay',
//       status: 'pending',
//       razorpayOrderId: order.id
//     };

//     await shipment.save();
//     // console.log('Shipment updated with payment details');

//     res.json({
//       success: true,
//       data: order
//     });

//   } catch (err) {
//     // console.error('\n!!! PAYMENT INITIATION ERROR !!!');
//     // console.error('Error:', err.message);
//     // console.error('Stack:', err.stack);
//     // console.error('Request details:', {
//     //   params: req.params,
//     //   body: req.body,
//     //   timestamp: new Date()
//     // });

//     res.status(500).json({
//       success: false,
//       error: 'Payment initiation failed',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   } finally {
//     // console.log('=== INITIATE PAYMENT COMPLETED ===\n');
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   // console.log('\n=== VERIFY PAYMENT STARTED ===');
//   // console.log('Request body:', req.body);

//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature, shipmentId } = req.body;

//   // console.log('Received fields:', {
//   //   razorpay_payment_id,
//   //   razorpay_order_id,
//   //   razorpay_signature: razorpay_signature ? '***REDACTED***' : 'MISSING',
//   //   shipmentId
//   // });

//   // Validation
//   if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !shipmentId) {
//     // console.log('Missing required fields');
//     return res.status(400).json({
//       success: false,
//       error: 'Missing required payment verification fields',
//       missingFields: {
//         razorpay_payment_id: !razorpay_payment_id,
//         razorpay_order_id: !razorpay_order_id,
//         razorpay_signature: !razorpay_signature,
//         shipmentId: !shipmentId
//       }
//     });
//   }

//   try {
//     // Signature Verification
//     // console.log('Verifying signature...');
//     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generatedSignature = hmac.digest('hex');

//     // console.log('Signature comparison:', {
//     //   received: razorpay_signature,
//     //   generated: generatedSignature,
//     //   match: generatedSignature === razorpay_signature
//     // });

//     if (generatedSignature !== razorpay_signature) {
//       // console.log('Signature mismatch');
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid payment signature'
//       });
//     }

//     // Find Shipment
//     // console.log('Looking for shipment:', shipmentId);
//     const shipment = await Shipment.findOne({
//       _id: shipmentId,
//       'payment.razorpayOrderId': razorpay_order_id
//     });

//     // console.log('Found shipment:', shipment ? shipment._id : 'NOT FOUND');

//     if (!shipment) {
//       // console.log('Shipment not found or order ID mismatch');
//       return res.status(404).json({
//         success: false,
//         error: 'Matching shipment not found',
//         details: {
//           searchedId: shipmentId,
//           orderId: razorpay_order_id
//         }
//       });
//     }

//     // Update Payment
//     // console.log('Updating shipment payment status');
//     shipment.payment = {
//       method: 'razorpay',
//       status: 'paid',
//       razorpayPaymentId: razorpay_payment_id,
//       razorpaySignature: razorpay_signature,
//       collectedAt: new Date()
//     };

//     // Add to payment history
//     const recordedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;

//     shipment.paymentHistory.push({
//       amount: shipment.cost,
//       method: 'razorpay',
//       transactionId: razorpay_payment_id,
//       ...(recordedBy && { recordedBy }) // Only add if valid ObjectId
//     });


//     await shipment.save();
//     // console.log('Shipment payment updated successfully');

//     // Update Driver Earnings
//     if (shipment.assignedDriver?.driverId) {
//       // console.log('Updating driver earnings for driver:', shipment.assignedDriver.driverId);
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
//       // console.log('Driver earnings updated');
//     }

//     res.json({
//       success: true,
//       message: 'Payment verified and recorded successfully'
//     });

//   } catch (err) {
//     console.error('\n!!! PAYMENT VERIFICATION ERROR !!!');
//     console.error('Error:', err.message);
//     console.error('Stack:', err.stack);
//     console.error('Verification details:', {
//       requestBody: req.body,
//       timestamp: new Date()
//     });

//     res.status(500).json({
//       success: false,
//       error: 'Payment verification failed',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   } finally {
//     // console.log('=== VERIFY PAYMENT COMPLETED ===\n');
//   }
// };

// exports.markCashPaid = async (req, res) => {
//   try {
//     // console.log('\n=== CASH PAYMENT INITIATED ===');

//     const shipment = await Shipment.findById(req.params.id);
//     // console.log('[CASH] Shipment fetched:', shipment);

//     if (!shipment) {
//       // console.log('[CASH] Shipment not found');
//       return res.status(404).json({
//         success: false,
//         error: 'Shipment not found'
//       });
//     }

//     // console.log('[CASH] Shipment status:', shipment.status);
//     if (shipment.status !== 'delivered') {
//       // console.log('[CASH] Shipment not yet delivered');
//       return res.status(400).json({
//         success: false,
//         error: 'Shipment must be delivered first'
//       });
//     }

//     // console.log('[CASH] Payment status:', shipment.payment?.status);
//     if (shipment.payment?.status !== 'pending') {
//       // console.log('[CASH] Payment already processed');
//       return res.status(400).json({
//         success: false,
//         error: 'Payment already processed'
//       });
//     }

//     // ✅ Use .toObject() to extract driverId safely
//     const shipmentObj = shipment.toObject();
//     const driverId = shipmentObj.assignedDriver && shipmentObj.assignedDriver._id;
//     // console.log('[CASH] Driver ID:', driverId);

//     if (!driverId) {
//       // console.log('[CASH] No valid driver assigned');
//       return res.status(400).json({
//         success: false,
//         error: 'No valid driver assigned'
//       });
//     }

//     // ✅ Update shipment payment
//     shipment.payment = {
//       method: 'cash',
//       status: 'paid',
//       collectedAt: new Date(),
//       collectedBy: driverId
//     };
//     // console.log('[CASH] Shipment payment updated');

//     // ✅ Add to shipment's payment history
//     shipment.paymentHistory.push({
//       amount: shipment.cost,
//       method: 'cash',
//       transactionId: `cash-${Date.now()}`,
//       recordedBy: driverId,
//       collectedAt: new Date()
//     });
//     // console.log('[CASH] Shipment payment history updated');

//     // ✅ Update driver earnings
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
//     // console.log('[CASH] Driver earnings updated');

//     await shipment.save();
//     // console.log('[CASH] Shipment saved successfully');

//     return res.json({
//       success: true,
//       message: 'Cash payment recorded successfully'
//     });

//   } catch (err) {
//     // console.error('[CASH] Error during cash payment:', err);
//     return res.status(500).json({
//       success: false,
//       error: 'Cash payment processing failed',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   } finally {
//     // console.log('=== CASH PAYMENT PROCESS COMPLETED ===\n');
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

// exports.initiatePayment = async (req, res) => {
//   // console.log('\n=== INITIATE PAYMENT STARTED ===');
//   // console.log('Request params:', req.params);
//   // console.log('Request body:', req.body);

//   try {
//     const shipment = await Shipment.findById(req.params.id);
//     // console.log('Found shipment:', shipment ? shipment._id : 'NOT FOUND');

//     if (!shipment) {
//       console.log('Shipment not found');
//       return res.status(404).json({
//         success: false,
//         error: 'Shipment not found'
//       });
//     }

//     // console.log('Shipment status:', shipment.status);
//     // console.log('Payment status:', shipment.payment?.status);

//     if (shipment.status !== 'delivered') {
//       console.log('Shipment not delivered yet');
//       return res.status(400).json({
//         success: false,
//         error: 'Shipment must be delivered before payment'
//       });
//     }

//     if (shipment.payment?.status !== 'pending') {
//       console.log('Payment already processed');
//       return res.status(400).json({
//         success: false,
//         error: 'Payment already processed'
//       });
//     }

//     const orderAmount = Math.round(shipment.cost * 100);
//     console.log('Creating order for amount:', orderAmount);

//     const order = await rzp.orders.create({
//       amount: orderAmount,
//       currency: 'INR',
//       receipt: `shipment_${shipment.trackingNumber}`,
//       payment_capture: 1 // Auto-capture payment
//     });

//     console.log('Razorpay order created:', order.id);

//     shipment.payment = {
//       method: 'razorpay',
//       status: 'pending',
//       razorpayOrderId: order.id
//     };

//     await shipment.save();
//     console.log('Shipment updated with payment details');

//     res.json({
//       success: true,
//       data: order
//     });

//   } catch (err) {
//     console.error('\n!!! PAYMENT INITIATION ERROR !!!');
//     console.error('Error:', err.message);
//     console.error('Stack:', err.stack);
//     console.error('Request details:', {
//       params: req.params,
//       body: req.body,
//       timestamp: new Date()
//     });

//     res.status(500).json({
//       success: false,
//       error: 'Payment initiation failed',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   } finally {
//     console.log('=== INITIATE PAYMENT COMPLETED ===\n');
//   }
// };
exports.initiatePayment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    console.log('Found shipment:', shipment ? shipment._id : 'NOT FOUND');

    if (!shipment) {
      console.log('Shipment not found');
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }

    // ✅ Allow both pending and delivered shipments
    console.log('Shipment status:', shipment.status); // can be 'pending', 'in-transit', 'delivered', etc.

    // ✅ Prevent duplicate payment
    if (shipment.payment?.status !== 'pending') {
      console.log('Payment already processed');
      return res.status(400).json({
        success: false,
        error: 'Payment already processed'
      });
    }

    const orderAmount = Math.round(shipment.cost * 100);
    console.log('Creating order for amount:', orderAmount);

    const order = await rzp.orders.create({
      amount: orderAmount,
      currency: 'INR',
      receipt: `shipment_${shipment.trackingNumber}`,
      payment_capture: 1 // Auto-capture payment
    });

    console.log('Razorpay order created:', order.id);

    shipment.payment = {
      method: 'razorpay',
      status: 'pending',
      razorpayOrderId: order.id
    };

    await shipment.save();
    console.log('Shipment updated with payment details');

    res.json({
      success: true,
      data: order
    });

  } catch (err) {
    console.error('\n!!! PAYMENT INITIATION ERROR !!!');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Request details:', {
      params: req.params,
      body: req.body,
      timestamp: new Date()
    });

    res.status(500).json({
      success: false,
      error: 'Payment initiation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    console.log('=== INITIATE PAYMENT COMPLETED ===\n');
  }
};


exports.verifyPayment = async (req, res) => {
  const startTime = new Date();
  console.log('\n=== ONLINE PAYMENT VERIFICATION STARTED ===');
  console.log('Timestamp:', startTime.toISOString());
  console.log('Request body:', {
    ...req.body,
    razorpay_signature: req.body.razorpay_signature ? '***REDACTED***' : 'MISSING'
  });

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, shipmentId } = req.body;

    // 1. Validate Required Fields
    console.log('\n[STEP 1] Validating required fields...');
    const missingFields = [];
    if (!razorpay_payment_id) missingFields.push('razorpay_payment_id');
    if (!razorpay_order_id) missingFields.push('razorpay_order_id');
    if (!razorpay_signature) missingFields.push('razorpay_signature');
    if (!shipmentId) missingFields.push('shipmentId');

    if (missingFields.length > 0) {
      console.error('[ERROR] Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }

    // 2. Verify Razorpay Signature
    console.log('\n[STEP 2] Verifying Razorpay signature...');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    console.log('Signature comparison:', {
      receivedLength: razorpay_signature.length,
      generatedLength: generatedSignature.length,
      match: generatedSignature === razorpay_signature
    });

    if (generatedSignature !== razorpay_signature) {
      console.error('[ERROR] Signature mismatch');
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
        details: {
          signatureMatch: false,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 3. Find Shipment
    console.log('\n[STEP 3] Finding shipment...');
    const shipment = await Shipment.findOne({
      _id: shipmentId,
      'payment.razorpayOrderId': razorpay_order_id
    });

    console.log('Shipment found:', shipment ? {
      _id: shipment._id,
      status: shipment.status,
      cost: shipment.cost,
      paymentStatus: shipment.payment?.status || 'none'
    } : 'NOT FOUND');

    if (!shipment) {
      console.error('[ERROR] Shipment not found or order ID mismatch');
      return res.status(404).json({
        success: false,
        error: 'Matching shipment not found',
        details: {
          shipmentId,
          razorpay_order_id,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 4. Validate Payment Status
    console.log('\n[STEP 4] Validating payment status...');
    console.log('Current payment status:', shipment.payment?.status || 'none');
    if (shipment.payment?.status !== 'pending') {
      console.error('[ERROR] Payment already processed');
      return res.status(400).json({
        success: false,
        error: 'Payment already processed',
        details: {
          currentStatus: shipment.payment?.status || 'none',
          requiredStatus: 'pending'
        }
      });
    }

    // 5. Prepare Updates
    console.log('\n[STEP 5] Preparing updates...');
    const paymentUpdate = {
      method: 'razorpay',
      status: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      collectedAt: new Date()
    };
    console.log('Payment update:', paymentUpdate);

    const paymentHistoryEntry = {
      amount: shipment.cost,
      method: 'razorpay',
      transactionId: razorpay_payment_id,
      recordedBy: req.user?.id,
      collectedAt: new Date()
    };
    console.log('Payment history entry:', paymentHistoryEntry);

    // 6. Prepare Driver Updates (if assigned)
    let driverUpdate = null;
    if (shipment.assignedDriver?.driverId) {
      console.log('\n[STEP 6] Preparing driver updates...');
      const driverId = shipment.assignedDriver.driverId;
      console.log('Driver ID:', driverId);

      driverUpdate = {
        $inc: {
          earnings: shipment.cost,
          'paymentBreakdown.online': shipment.cost,
          'currentDaySettlement.onlineCollected': shipment.cost,
          'currentDaySettlement.driverEarned': shipment.cost * 0.8
        },
        $push: {
          collectedPayments: {
            shipment: shipment._id,
            amount: shipment.cost,
            method: 'online',
            collectedAt: new Date()
          }
        },
        $set: {
          'currentDaySettlement.lastUpdated': new Date()
        }
      };
      console.log('Driver update operation:', JSON.stringify(driverUpdate, null, 2));
    } else {
      console.log('No driver assigned - skipping driver updates');
    }

    // 7. Execute Updates in Transaction
    console.log('\n[STEP 7] Starting database transaction...');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log('Updating shipment document...');
      shipment.payment = paymentUpdate;
      shipment.paymentHistory.push(paymentHistoryEntry);
      await shipment.save({ session });

      if (driverUpdate) {
        console.log('Updating driver document...');
        await Driver.findByIdAndUpdate(
          shipment.assignedDriver.driverId,
          driverUpdate,
          { new: true, session }
        );
      }

      console.log('Committing transaction...');
      await session.commitTransaction();
      console.log('Transaction committed successfully');
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError.message);
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

    // 8. Verify Updates
    console.log('\n[STEP 8] Verifying updates...');
    const updatedShipment = await Shipment.findById(shipmentId);
    console.log('Updated shipment payment:', updatedShipment.payment);

    if (shipment.assignedDriver?.driverId) {
      const updatedDriver = await Driver.findById(shipment.assignedDriver.driverId);
      console.log('Updated driver settlement:', {
        earnings: updatedDriver.earnings,
        onlineCollected: updatedDriver.currentDaySettlement.onlineCollected,
        driverEarned: updatedDriver.currentDaySettlement.driverEarned
      });
    }

    const endTime = new Date();
    const processingTime = endTime - startTime;
    console.log('\n=== ONLINE PAYMENT VERIFICATION COMPLETED ===');
    console.log('Total processing time:', processingTime + 'ms');

    res.json({
      success: true,
      message: 'Payment verified and recorded successfully',
      details: {
        shipmentId,
        razorpay_payment_id,
        processingTime
      }
    });

  } catch (err) {
    console.error('\n!!! ONLINE PAYMENT VERIFICATION FAILED !!!');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Error occurred at:', new Date().toISOString());

    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      details: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : undefined
    });
  }
};

exports.markCashPaid = async (req, res) => {
  const startTime = new Date();
  console.log('\n=== CASH PAYMENT PROCESS STARTED ===');
  console.log('Timestamp:', startTime.toISOString());
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);

  try {
    // 1. Fetch Shipment
    console.log('\n[STEP 1] Fetching shipment...');
    const shipment = await Shipment.findById(req.params.id);
    console.log('Shipment found:', shipment ? {
      _id: shipment._id,
      status: shipment.status,
      cost: shipment.cost,
      paymentStatus: shipment.payment?.status || 'none'
    } : 'NOT FOUND');

    if (!shipment) {
      console.error('[ERROR] Shipment not found');
      return res.status(404).json({
        success: false,
        error: 'Shipment not found',
        details: {
          shipmentId: req.params.id,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 2. Validate Shipment Status
    console.log('\n[STEP 2] Validating shipment status...');
    console.log('Current status:', shipment.status);
if (shipment.status !== 'picked_up' && shipment.status !== 'awaiting_payment'){
      console.error('[ERROR] Shipment not delivered');
      return res.status(400).json({
        success: false,
        error: 'Shipment must be picked_up first',
        details: {
          currentStatus: shipment.status,
          requiredStatus: 'picked_up or awaiting_payment'
        }
      });
    }

    // 3. Validate Payment Status
    console.log('\n[STEP 3] Checking payment status...');
    console.log('Current payment status:', shipment.payment?.status || 'none');
    if (shipment.payment?.status !== 'pending') {
      console.error('[ERROR] Payment already processed');
      return res.status(400).json({
        success: false,
        error: 'Payment already processed',
        details: {
          currentPaymentStatus: shipment.payment?.status || 'none',
          requiredStatus: 'pending'
        }
      });
    }

    // 4. Extract Driver Info
    console.log('\n[STEP 4] Extracting driver information...');
    const shipmentObj = shipment.toObject();
    const driverId = shipmentObj.assignedDriver?._id || shipmentObj.assignedDriver?.driverId;
    console.log('Driver ID extracted:', driverId);

    if (!driverId) {
      console.error('[ERROR] No valid driver assigned');
      return res.status(400).json({
        success: false,
        error: 'No valid driver assigned',
        details: {
          assignedDriver: shipment.assignedDriver
        }
      });
    }

    // 5. Prepare Shipment Updates
    console.log('\n[STEP 5] Preparing shipment updates...');
    const paymentUpdate = {
      method: 'cash',
      status: 'paid',
      collectedAt: new Date(),
      collectedBy: driverId
    };
    console.log('Payment update to apply:', paymentUpdate);

    const paymentHistoryEntry = {
      amount: shipment.cost,
      method: 'cash',
      transactionId: `cash-${Date.now()}`,
      recordedBy: driverId,
      collectedAt: new Date()
    };
    console.log('Payment history entry:', paymentHistoryEntry);

    // 6. Prepare Driver Updates
    console.log('\n[STEP 6] Preparing driver updates...');
    const driverEarningsUpdate = {
      $inc: {
        earnings: shipment.cost,
        'paymentBreakdown.cash': shipment.cost,
        'currentDaySettlement.cashCollected': shipment.cost,
        'currentDaySettlement.ownerEarned': shipment.cost * 0.2
      },
      $push: {
        collectedPayments: {
          shipment: shipment._id,
          amount: shipment.cost,
          method: 'cash',
          collectedAt: new Date()
        }
      },
      $set: {
        'currentDaySettlement.lastUpdated': new Date()
      }
    };
    console.log('Driver update operation:', JSON.stringify(driverEarningsUpdate, null, 2));

    // 7. Execute Updates in Transaction
    console.log('\n[STEP 7] Starting database transaction...');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log('Updating shipment document...');
      shipment.payment = paymentUpdate;
      shipment.paymentHistory.push(paymentHistoryEntry);
      await shipment.save({ session });

      console.log('Updating driver document...');
      await Driver.findByIdAndUpdate(
        driverId,
        driverEarningsUpdate,
        { new: true, session }
      );

      console.log('Committing transaction...');
      await session.commitTransaction();
      console.log('Transaction committed successfully');
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError.message);
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

    // 8. Verify Updates
    console.log('\n[STEP 8] Verifying updates...');
    const updatedShipment = await Shipment.findById(req.params.id);
    const updatedDriver = await Driver.findById(driverId);

    console.log('Updated shipment payment:', {
      status: updatedShipment.payment.status,
      method: updatedShipment.payment.method,
      collectedAt: updatedShipment.payment.collectedAt
    });

    console.log('Updated driver settlement:', {
      earnings: updatedDriver.earnings,
      cashCollected: updatedDriver.currentDaySettlement.cashCollected,
      ownerEarned: updatedDriver.currentDaySettlement.ownerEarned
    });

    const endTime = new Date();
    const processingTime = endTime - startTime;
    console.log('\n=== CASH PAYMENT PROCESS COMPLETED ===');
    console.log('Total processing time:', processingTime + 'ms');

    return res.json({
      success: true,
      message: 'Cash payment recorded successfully',
      details: {
        shipmentId: shipment._id,
        driverId,
        amount: shipment.cost,
        processingTime
      }
    });

  } catch (err) {
    console.error('\n!!! CASH PAYMENT PROCESS FAILED !!!');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Error occurred at:', new Date().toISOString());

    return res.status(500).json({
      success: false,
      error: 'Cash payment processing failed',
      details: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : undefined
    });
  }

};
