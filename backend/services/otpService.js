const axios = require('axios');

const sendSms = async (phoneNumber, message) => {
  console.log('[SMS] Preparing to send to:', phoneNumber);
  
  const params = {
    username: process.env.SMS_USERNAME ,
    message: message,
    sendername: process.env.SMS_SENDERNAME,
    smstype: 'TRANS',
    numbers: phoneNumber.replace('+', ''),
    apikey: process.env.SMS_API_KEY ,
  };

  // console.log('[SMS] Final params:', {
  //   ...params,
  //   apikey: '***masked***' // Don't log full API key
  // });

  try {
    const response = await axios.get('http://sms.aquasms.com/sendSMS', { 
      params,
      timeout: 10000 
    });
    
    console.log('[SMS] Response:', {
      status: response.status,
      data: response.data
    });

    if (response.data?.includes('Failed') || 
       (Array.isArray(response.data) && response.data.some(item => item.responseCode?.includes('Failed')))) {
      throw new Error('SMS provider returned failure');
    }

    return { success: true };
  } catch (error) {
    console.error('[SMS] Error:', {
      message: error.message,
      response: error.response?.data
    });
    throw new Error('Failed to send SMS');
  }
};

module.exports = sendSms;