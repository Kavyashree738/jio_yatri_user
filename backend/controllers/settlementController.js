const Driver = require('../models/Driver');
const mongoose = require('mongoose');
const moment = require('moment');

// Helper function to ensure valid numbers
const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

exports.recordPayment = async (req, res) => {
  try {
    console.log('\n=== STARTING PAYMENT RECORDING ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { driverId, amount, method } = req.body;
    
    if (!['cash', 'online'].includes(method)) {
      console.error('Invalid payment method:', method);
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const paymentAmount = safeNumber(amount);
    if (paymentAmount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    console.log(`Processing ${method} payment of ₹${paymentAmount} for driver ${driverId}`);

    // Calculate earnings breakdown
    const driverEarned = method === 'online' ? paymentAmount * 0.8 : paymentAmount;
    const ownerEarned = method === 'cash' ? paymentAmount * 0.2 : 0;

    console.log('Calculated earnings:', {
      driverEarned,
      ownerEarned
    });

    const update = {
      $inc: {
        [`currentDaySettlement.${method}Collected`]: paymentAmount,
        'currentDaySettlement.driverEarned': safeNumber(driverEarned),
        'currentDaySettlement.ownerEarned': safeNumber(ownerEarned),
        'earnings': safeNumber(driverEarned),
        [`paymentBreakdown.${method}`]: paymentAmount
      },
      $push: {
        collectedPayments: {
          amount: paymentAmount,
          method,
          collectedAt: new Date()
        }
      },
      $set: {
        'currentDaySettlement.lastUpdated': new Date()
      }
    };

    console.log('Preparing MongoDB update operation:', JSON.stringify(update, null, 2));

    const result = await Driver.findByIdAndUpdate(
      driverId, 
      update,
      { new: true }
    );

    if (!result) {
      console.error('Driver not found with ID:', driverId);
      return res.status(404).json({ error: 'Driver not found' });
    }

    console.log('Update successful. Driver after update:', {
      _id: result._id,
      name: result.name,
      currentDaySettlement: result.currentDaySettlement,
      paymentBreakdown: result.paymentBreakdown,
      earnings: result.earnings
    });

    res.json({ 
      success: true, 
      driver: {
        currentDaySettlement: result.currentDaySettlement,
        paymentBreakdown: result.paymentBreakdown
      }
    });
  } catch (err) {
    console.error('PAYMENT RECORDING ERROR:', {
      message: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.dailySettlement = async (req, res) => {
  const startTime = new Date();
  console.log('\n=== DAILY SETTLEMENT PROCESS STARTED ===');
  console.log('Server Time:', startTime.toString());
  console.log('ISO Time:', startTime.toISOString());
  console.log('Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

  try {
    // 1. Prepare query
    const query = {
      $or: [
        { 'currentDaySettlement.cashCollected': { $gt: 0 } },
        { 'currentDaySettlement.onlineCollected': { $gt: 0 } }
      ]
    };
    console.log('\n[STEP 1] Settlement query:', JSON.stringify(query, null, 2));

    // 2. Find eligible drivers
    console.log('\n[STEP 2] Finding drivers needing settlement...');
    const drivers = await Driver.find(query)
      .select('_id name currentDaySettlement paymentSettlements')
      .lean();

    console.log(`Found ${drivers.length} drivers needing settlement`);
    drivers.forEach(driver => {
      console.log(`- ${driver.name} (${driver._id}):`, {
        cash: driver.currentDaySettlement.cashCollected,
        online: driver.currentDaySettlement.onlineCollected
      });
    });

    if (drivers.length === 0) {
      console.log('No drivers need settlement today');
      return res.json({ 
        success: true, 
        message: 'No drivers need settlement today',
        timestamp: new Date().toISOString()
      });
    }

    // 3. Process each driver
    const settlementResults = [];
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const driver of drivers) {
        console.log(`\nProcessing driver ${driver._id} (${driver.name})`);
        
        const cashCollected = safeNumber(driver.currentDaySettlement.cashCollected);
        const onlineCollected = safeNumber(driver.currentDaySettlement.onlineCollected);

        const settlementData = {
          date: new Date(),
          cashCollected,
          onlineCollected,
          driverEarned: safeNumber(onlineCollected * 0.8),
          ownerEarned: safeNumber(cashCollected * 0.2),
          driverToOwner: safeNumber(cashCollected * 0.2),
          ownerToDriver: safeNumber(onlineCollected * 0.8),
          status: 'pending'
        };

        console.log('Settlement data:', JSON.stringify(settlementData, null, 2));

        // Update driver document
        const updateResult = await Driver.findByIdAndUpdate(
          driver._id,
          {
            $push: { paymentSettlements: settlementData },
            $set: {
              'currentDaySettlement': {
                cashCollected: 0,
                onlineCollected: 0,
                driverEarned: 0,
                ownerEarned: 0,
                lastUpdated: new Date()
              }
            }
          },
          { new: true, session }
        );

        console.log('Update result:', {
          matched: updateResult ? 1 : 0,
          currentDayReset: updateResult?.currentDaySettlement
        });

        settlementResults.push({
          driverId: driver._id,
          name: driver.name,
          settlement: settlementData,
          success: true
        });
      }

      // Commit transaction
      console.log('\nCommitting transaction...');
      await session.commitTransaction();
      console.log('Transaction committed successfully');
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError.message);
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

    // 4. Verify results
    console.log('\n[STEP 4] Verifying settlements...');
    for (const result of settlementResults) {
      const updatedDriver = await Driver.findById(result.driverId)
        .select('paymentSettlements currentDaySettlement')
        .lean();

      console.log(`Driver ${result.driverId}:`, {
        settlementsCount: updatedDriver.paymentSettlements.length,
        latestSettlement: updatedDriver.paymentSettlements.slice(-1)[0],
        currentDay: updatedDriver.currentDaySettlement
      });
    }

    const endTime = new Date();
    const processingTime = endTime - startTime;
    console.log('\n=== DAILY SETTLEMENT COMPLETED ===');
    console.log('Total processing time:', processingTime + 'ms');
    console.log('Processed drivers:', settlementResults.length);

    res.json({ 
      success: true, 
      processed: settlementResults.length,
      results: settlementResults,
      processingTime
    });

  } catch (err) {
    console.error('\n!!! DAILY SETTLEMENT FAILED !!!');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Failed at:', new Date().toISOString());

    res.status(500).json({ 
      success: false,
      error: 'Daily settlement failed',
      details: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getDriverSettlement = async (req, res) => {
  try {
    console.log(`Fetching settlement for driver: ${req.params.userId}`);
    
    const driver = await Driver.findOne({ userId: req.params.userId })
      .select('currentDaySettlement paymentSettlements');
    
    if (!driver) {
      console.error('Driver not found:', req.params.userId);
      return res.status(404).json({ error: 'Driver not found' });
    }

    console.log('Found driver settlement data:', {
      today: driver.currentDaySettlement,
      pendingCount: driver.paymentSettlements.filter(s => s.status === 'pending').length
    });

    res.json({
      today: driver.currentDaySettlement,
      pendingSettlements: driver.paymentSettlements.filter(s => s.status === 'pending')
    });
  } catch (err) {
    console.error('Error fetching driver settlement:', {
      userId: req.params.userId,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.completeSettlement = async (req, res) => {
  try {
    console.log('\n=== COMPLETING SETTLEMENT ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);

    const { settlementId } = req.body;
    
    const driver = await Driver.findOneAndUpdate(
      { userId: req.params.userId, 'paymentSettlements._id': settlementId },
      {
        $set: {
          'paymentSettlements.$.status': 'settled',
          'paymentSettlements.$.settledAt': new Date()
        }
      },
      { new: true }
    );

    if (!driver) {
      console.error('Driver or settlement not found:', {
        userId: req.params.userId,
        settlementId
      });
      return res.status(404).json({ 
        error: 'Driver or settlement not found',
        details: {
          userId: req.params.userId,
          settlementId
        }
      });
    }

    const updatedSettlement = driver.paymentSettlements.id(settlementId);
    console.log('Successfully updated settlement:', {
      settlementId,
      status: updatedSettlement.status,
      settledAt: updatedSettlement.settledAt
    });

    res.json({ 
      success: true, 
      driver: {
        _id: driver._id,
        name: driver.name,
        settlement: updatedSettlement
      }
    });
  } catch (err) {
    console.error('SETTLEMENT COMPLETION ERROR:', {
      message: err.message,
      stack: err.stack,
      params: req.params,
      body: req.body
    });
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};