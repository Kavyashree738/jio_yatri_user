const admin = require('firebase-admin');
const Driver = require('../models/Driver');
const Shop = require('../models/CategoryModel')
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  console.log('[INIT] Initializing Firebase Admin SDK...');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('[INIT] Firebase Admin initialized');
} else {
  console.log('[INIT] Firebase Admin already initialized');
}

const sendToToken = async (token, { title, body, data = {} }) => {
  const message = {
    token,
    // ✅ Only send data payload, remove webpush.notification completely
    data: {
      title,
      body,
      ...data,
      link: '/business-orders',
    },
    android: { priority: 'high' },
  };

  try {
    const resp = await admin.messaging().send(message);
    console.log('[FCM] sent ok ->', token.slice(0, 12), '…', resp);
    return { ok: true, resp };
  } catch (err) {
    console.error('[FCM] send error ->', token.slice(0, 12), '…', err.code || err.errorInfo?.code, err.message);
    return { ok: false, err };
  }
};

// Update to only use the array approach
const sendToManyTokens = async (tokens, payload, shopId) => {
  if (!tokens || tokens.length === 0) return;

  const results = await Promise.all(tokens.map(t => sendToToken(t, payload)));

  // Clean up invalid tokens
  const badTokens = [];
  results.forEach((result, index) => {
    if (!result.ok) {
      const errorCode = result.err?.errorInfo?.code;
      if (errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered') {
        badTokens.push(tokens[index]);
      }
    }
  });

  if (badTokens.length > 0) {
    await Shop.updateOne(
      { _id: shopId },
      { $pull: { fcmTokens: { $in: badTokens } } }
    );
    console.log(`[FCM] Removed ${badTokens.length} invalid tokens`);
  }
};
/**
 * Send FCM notification to a driver
 * @param {string} driverId - Firebase UID of the driver
 * @param {string} title - Notification title
 * @param {string} body - Notification message
 * @param {object} data - Additional data (e.g., shipment details)
 */


const sendNotificationToDriver = async (driverId, title, body, data = {}) => {
  try {
    console.log('[SEND] Looking up driver in DB:', driverId);

    // Fetch driver's FCM token from DB
    const driver = await Driver.findOne({ userId: driverId });

    if (!driver) {
      console.log('[SEND] Driver not found:', driverId);
      return;
    }

    if (!driver.fcmToken) {
      console.log('[SEND] No FCM token for driver:', driverId);
      return;
    }

    console.log('[SEND] FCM token found:', driver.fcmToken);

    const message = {
    
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      android: {
      priority: 'high',
      // Optional: uncomment if you want to force the same channel as Dart
      // notification: { channelId: 'driver_general' },
    },
      token: driver.fcmToken,
    };

    console.log('[SEND] Sending message via FCM:', JSON.stringify(message, null, 2));

    const response = await admin.messaging().send(message);

    console.log('[SEND] Notification sent successfully. FCM Response:', response);
    return response;
  } catch (error) {
    console.error('[SEND] Error sending FCM:', error.message);

    const errorCode = error?.errorInfo?.code;
    if (errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered') {
      console.log(`[SEND] Removing invalid FCM token for driver ${driverId}`);
      await Driver.updateOne(
        { userId: driverId },
        { $unset: { fcmToken: "" } }
      );
    }

    // Don’t throw, just return error so it won’t break shipment creation
    return { ok: false, error: error.message };
  }
};

/**
 * Notify driver when a new shipment is available
 */
const notifyNewShipment = async (driverId, shipment) => {
  console.log('[NOTIFY] notifyNewShipment called');
  console.log('[NOTIFY] Driver ID:', driverId);
  console.log('[NOTIFY] Shipment Info:', {
    id: shipment._id,
    vehicleType: shipment.vehicleType
  });
  const title = 'JioYatri Driver — New shipment';
  const pickup = shipment.sender?.address?.addressLine1 || 'Unknown pickup';
  const drop = shipment.receiver?.address?.addressLine1 || 'Unknown drop';
const cost = shipment.cost ? `₹${shipment.cost.toFixed(2)}` : 'N/A';
const vehicleType = shipment.vehicleType || '—';

const body = `Pickup: ${pickup}\nDrop: ${drop}\nAmount: ${cost}\nVehicle: ${vehicleType}`;

  try {
    const result = await sendNotificationToDriver(driverId, title, body, {
  shipmentId: shipment._id.toString(),
  type: 'NEW_SHIPMENT',
  pickup,
  drop,
  cost: shipment.cost ? shipment.cost.toFixed(2) : '',
  vehicleType,
  icon: '/logo.jpg',
});

    console.log('[NOTIFY] Notification result:', result);
    return result;
  } catch (err) {
    console.error('[NOTIFY] Error while notifying driver:', err.message);
    throw err;
  }
};

const notifyShopNewOrder = async (shopId, orderDoc) => {
  const shop = await Shop.findById(shopId).lean();
  if (!shop) return;

  // ✅ Extract order details
  const customerName = orderDoc.customer?.name || 'Customer';
  const orderCode = orderDoc.orderCode || '';
  const address = orderDoc.address?.line || 'Unknown address';

  // ✅ Prepare a short summary of items
  let itemList = '';
  if (Array.isArray(orderDoc.items) && orderDoc.items.length) {
    const names = orderDoc.items.map(it => `${it.name} ×${it.quantity || 1}`);
    // show only first 3 to keep message short
    itemList = names.slice(0, 3).join(', ');
    if (names.length > 3) itemList += ` +${names.length - 3} more`;
  } else {
    itemList = 'No items listed';
  }

  // ✅ Notification content
  const title = '🛍️ New Order Received';
  const body = `${customerName} placed order ${orderCode}\n📍 ${address}\n🧾 ${itemList}`;

  // ✅ Data payload for FCM
  const data = {
    type: 'NEW_ORDER',
    orderId: String(orderDoc._id),
    orderCode,
    shopId: String(shopId),
    customerName,
    address,
    items: orderDoc.items?.map(it => ({
      name: it.name,
      qty: it.quantity,
      price: it.price,
    })) || [],
  };

  // ✅ Send notification to all FCM tokens
  const tokens = Array.isArray(shop.fcmTokens) ? shop.fcmTokens.filter(Boolean) : [];
  if (tokens.length) {
    await sendToManyTokens(tokens, { title, body, data }, shopId);
  } else if (shop.fcmToken) {
    await sendToToken(shop.fcmToken, { title, body, data });
  } else {
    console.warn('[FCM] ⚠ No tokens found for shop', String(shopId));
  }
};


module.exports = {
  sendNotificationToDriver,
  notifyNewShipment,
  notifyShopNewOrder,
};
