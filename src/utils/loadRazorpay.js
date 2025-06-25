export default function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      console.log('Razorpay already loaded');
      return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
}