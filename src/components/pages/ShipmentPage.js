import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import LocationMap from './LocationMap';
import { FaMapMarkerAlt, FaChevronRight, FaUser, FaPhone, FaExchangeAlt } from 'react-icons/fa';
import '../../styles/components.css';
import SearchBar from '../pages/SearchBar';
import SecondaryNav from './SecondaryNav';
import defaultDriverImg from '../../assets/images/profile.png';
import LocationTracker from '../LocationTracker';
import driver from '../../assets/images/driver-avatar.png'
import driverTruck from '../../assets/images/driverTruck.png'
import razorpayLogo from '../../assets/images/razorpay-badge.svg'
import Lottie from "lottie-react";
import driverAnimation from "../../assets/animations/delivery-boy.json.json"; // your downloaded file
import driverWaiting from "../../assets/animations/driver.json"; // your downloaded file




// import { FaPhone } from 'react-icons/fa';


const vehicleTypes = [
  {
    type: 'TwoWheeler',
    name: 'Bike',
    rate: 30,
    rateFor2Km: 60,
    emoji: '🛵',
    capacity: 'Up to 20kg',
    available: true,
    displayRate: "₹60 per 2 km"
  },
  {
    type: 'ThreeWheeler',
    name: 'Auto',
    rate: 40,
    rateFor2Km: 80,
    emoji: '🛺',
    capacity: 'Up to 200kg',
    available: true,
    displayRate: "₹80 per 2 km"
  },
  {
    type: 'Truck',
    name: 'Truck',
    rate: 60,
    rateFor2Km: 120,
    emoji: '🚚',
    capacity: 'Up to 1200kg',
    available: true,
    displayRate: "₹120 per 2 km"
  },
  {
    type: 'Pickup9ft',
    name: 'bulara',
    rate: 175,
    rateFor2Km: 350,
    emoji: '🛻',
    capacity: 'Up to 1700kg',
    available: true,
    displayRate: "₹350 per 2 km"
  },
  {
    type: 'Tata407',
    name: 'Tata 407',
    rate: 300,
    rateFor2Km: 600,
    emoji: '🚛',
    capacity: 'Up to 2500kg',
    available: true,
    displayRate: "₹600 per 2 km"
  },
  {
    type: 'ContainerTruck',
    name: 'Container Truck',
    rate: 80,
    rateFor2Km: 160,
    emoji: '🚒',
    capacity: 'Up to 5000kg',
    available: false,
    comingSoon: true,
    displayRate: "₹700 per 2 km"
  }
];

const paymentMethods = [
  { id: 'razorpay', name: 'Online', description: 'Secure payment with Razorpay', icon: '💳' },
  // { id: 'pay_after', name: 'Cash', description: 'Pay online after delivery is completed', icon: '💸' }
];

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function ShipmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [calculatedCosts, setCalculatedCosts] = useState({});
  const [distance, setDistance] = useState(0);
  // const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('pay_after');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  // const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const debounceTimer = useRef(null);
  const [userClickedBack, setUserClickedBack] = useState(false);
  const [shouldAutoProgress, setShouldAutoProgress] = useState(true);
  const [shipmentStatus, setShipmentStatus] = useState(null);
  const [assignedShipment, setAssignedShipment] = useState(null);

  const [eligibleForCash, setEligibleForCash] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("razorpay");

  const [driverImageSrc, setDriverImageSrc] = useState(defaultDriverImg);



  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [currentDocType, setCurrentDocType] = useState(null); // optional, for future




  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    type: null,
    id: null
  });

  const [preAssignCancelModal, setPreAssignCancelModal] = useState({
    visible: false,
    id: null
  });



  //   const [shipmentData, setShipmentData] = useState(() => {
  //     const locationState = location.state?.shipmentData;
  //     // const shopData = location.state?.shop;

  //     // if (shopData) {
  //     //   return {
  //     //     sender: {
  //     //       name: shopData.shopName,
  //     //       phone: shopData.phone,
  //     //       email: shopData.email || '',
  //     //       address: {
  //     //         addressLine1: shopData.address?.address || '',
  //     //         coordinates: shopData.address?.coordinates || null
  //     //       }
  //     //     },
  //     //     receiver: {
  //     //       name: '',
  //     //       phone: '',
  //     //       email: '',
  //     //       address: {
  //     //         addressLine1: '',
  //     //         coordinates: null
  //     //       }
  //     //     },
  //     //     parcel: {
  //     //       description: '',
  //     //       images: []
  //     //     },
  //     //     vehicleType: 'TwoWheeler',
  //     //     distance: 0,
  //     //     cost: 0,
  //     //     paymentMethod: 'pay_after',
  //     //     shopId: shopData._id,
  //     //     isShopOrder: true
  //     //   };
  //     // }
  // return locationState || {
  //   sender: { name: '', phone: '', email: '', address: { addressLine1: '', coordinates: null } },
  //   receiver: { name: '', phone: '', email: '', address: { addressLine1: '', coordinates: null } },
  //   parcel: { description: '', images: [] },
  //   vehicleType: 'TwoWheeler',
  //   distance: 0,
  //   cost: 0,
  //   paymentMethod: 'pay_after',
  //   isShopOrder: false
  // };

  //     return locationState || {
  //       sender: {
  //         name: '',
  //         phone: '',
  //         email: '',
  //         address: {
  //           addressLine1: '',
  //           coordinates: null
  //         }
  //       },
  //       receiver: {
  //         name: '',
  //         phone: '',
  //         email: '',
  //         address: {
  //           addressLine1: '',
  //           coordinates: null
  //         }
  //       },
  //       parcel: {
  //         description: '',
  //         images: []
  //       },
  //       vehicleType: 'TwoWheeler',
  //       distance: 0,
  //       cost: 0,
  //       paymentMethod: 'pay_after',
  //       isShopOrder: false
  //     };
  //   });

  const [shipmentData, setShipmentData] = useState(() => {
    const locationState = location.state?.shipmentData;

    return locationState || {
      sender: {
        name: '',
        phone: '',
        email: '',
        address: {
          addressLine1: '',
          coordinates: null
        }
      },
      receiver: {
        name: '',
        phone: '',
        email: '',
        address: {
          addressLine1: '',
          coordinates: null
        }
      },
      parcel: {
        description: '',
        images: []
      },
      vehicleType: 'TwoWheeler',
      distance: 0,
      cost: 0,
      paymentMethod: 'pay_after'
    };
  });

  // Debugging logs for state changes
  useEffect(() => {
    // console.log('Shipment data updated:', shipmentData);
  }, [shipmentData]);

  useEffect(() => {
    scrollToTop();
  }, [success, currentStep]);

  // 🧭 Monitor shipment status changes
  useEffect(() => {
    if (assignedShipment?.status) {
      console.log("📦 Shipment Status Updated →", assignedShipment.status);
    }
  }, [assignedShipment?.status]);


  useEffect(() => {
    async function checkShipmentCount() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await axios.get("https://jio-yatri-user.onrender.com/api/shipments/count", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Only after 3 completed paid shipments
        if (res.data.completedCount >= 3) setEligibleForCash(true);
        else setEligibleForCash(false);
      } catch (err) {
        console.error("Error checking shipment count:", err.message);
      }
    }
    checkShipmentCount();
  }, [user]);




  // 🟢 If shop order, directly go to Step 4 (tracking view)
  // useEffect(() => {
  //   if (shipmentData.isShopOrder) {
  //     console.log("🛍️ Shop order detected — skipping steps 1–3");
  //     setCurrentStep(4);
  //     setSuccess(true);
  //   }
  // }, [shipmentData.isShopOrder]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });

          setShipmentData(prev => {
            if (!prev.sender.address.coordinates) {
              return {
                ...prev,
                sender: {
                  ...prev.sender,
                  address: {
                    ...prev.sender.address,
                    coordinates: { lat: latitude, lng: longitude }
                  }
                }
              };
            }
            return prev;
          });
        },
        (error) => {
          setLocationError(error.message);
          // console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  // 🧹 Ensure no cancelled shipment is restored from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("assignedShipment");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.status === "cancelled") {
        console.warn("🧹 Removing cancelled shipment from storage");
        localStorage.removeItem("assignedShipment");
        setAssignedShipment(null);
        setCurrentStep(1);
        setSuccess(false);
        setTrackingNumber("");
        setShipmentStatus(null);
      }
    }
  }, []);


  useEffect(() => {
    const { selectedAddress, type } = location.state || {};

    if (selectedAddress && type) {
      setShipmentData(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          address: {
            addressLine1: selectedAddress.address,
            coordinates: selectedAddress.coordinates
          }
        }
      }));

      if (shipmentData.sender.address.coordinates && shipmentData.receiver.address.coordinates) {
        calculateDistance(true);
      }

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, shipmentData.sender.address.coordinates, shipmentData.receiver.address.coordinates]);

  useEffect(() => {
    const { sender, receiver } = shipmentData;
    if (sender.address.coordinates && receiver.address.coordinates) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        calculateDistance(true);
      }, 500);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [shipmentData.sender.address.coordinates, shipmentData.receiver.address.coordinates]);

  // ✅ Restore saved shipment if driver already accepted earlier
  // useEffect(() => {
  //   const saved = localStorage.getItem("assignedShipment");
  //   if (saved) {
  //     const parsed = JSON.parse(saved);
  //     setAssignedShipment(parsed);
  //     setTrackingNumber(parsed.trackingNumber || "");
  //     setCurrentStep(3); // go directly to payment screen
  //   }
  // }, []);


  useEffect(() => {
    const saved = localStorage.getItem("assignedShipment");
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("🟢 Restored shipment from localStorage:", parsed);
      setAssignedShipment(parsed);
      setTrackingNumber(parsed.trackingNumber || "");

      if (user && parsed.trackingNumber) {
        user.getIdToken().then(async (token) => {
          try {
            const res = await axios.get(
              `https://jio-yatri-user.onrender.com/api/shipments/tracking/${parsed.trackingNumber}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const fresh = res.data;
            console.log("🔵 Fresh shipment from backend:", fresh);

            setAssignedShipment(fresh);

            if (fresh.status === "pending") {
              console.log("🟡 Awaiting driver → Step 3 (waiting page)");
              setCurrentStep(3);
              setSuccess(true);
            } else if (fresh.status === "awaiting_payment" && fresh.assignedDriver) {
              console.log("🟢 Driver accepted → Shipment accepted page");
              setCurrentStep(3);
              setSuccess(true);
            } else if (fresh.payment?.status === "paid") {
              console.log("💰 Payment completed → Step 4 (tracking)");
              setCurrentStep(4);
              setSuccess(true);
            } else if (fresh.status === "awaiting_driver") {
              console.log("🟡 Still awaiting driver → keep showing Step 3");
              setCurrentStep(3);
              setSuccess(true);
            } else {
              console.log("⚪ Defaulting to Step 1 (new shipment)");
              setCurrentStep(1);
            }


            localStorage.setItem("assignedShipment", JSON.stringify(fresh));
          } catch (err) {
            console.error("❌ Restore check failed:", err.message);
            setCurrentStep(1);
          }
        });
      }
    } else {
      console.log("⚪ No assignedShipment found in localStorage");
    }
  }, [user]);





  useEffect(() => {
    if (currentStep === 1 && validateStep1() && shouldAutoProgress) {
      const timer = setTimeout(() => {
        calculateDistance().then(valid => {
          if (valid) setCurrentStep(2);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shipmentData, currentStep, shouldAutoProgress]);


  // 🧹 Clear localStorage + reset UI when shipment is picked up
  useEffect(() => {
    if (assignedShipment?.status === "picked_up") {
      console.warn("📦 Shipment picked up — navigating to /orders");

      // ✅ Navigate first (so it happens before state resets)
      navigate("/orders", { replace: true });

      // ✅ Then reset states after a short delay
      setTimeout(() => {
        localStorage.removeItem("assignedShipment");
        setAssignedShipment(null);
        setTrackingNumber("");
        setSuccess(false);
        setCurrentStep(1);
        setCalculatedCosts({});
        setDistance(0);
        setShipmentData({
          sender: { name: "", phone: "", email: "", address: { addressLine1: "", coordinates: null } },
          receiver: { name: "", phone: "", email: "", address: { addressLine1: "", coordinates: null } },
          parcel: { description: "", images: [] },
          vehicleType: "TwoWheeler",
          distance: 0,
          cost: 0,
          paymentMethod: "pay_after",
          isShopOrder: false,
        });
        scrollToTop();
      }, 500);
    }
  }, [assignedShipment?.status, navigate]);


//   useEffect(() => {
//   const fetchSelfie = async () => {
//     try {
//       if (!user?.uid) return;

//       const token = await user.getIdToken();
//       const res = await fetch(`http://localhost:5001/api/upload/selfie/${user.uid}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         console.warn("🟡 No selfie found, using default.");
//         setDriverImageSrc(defaultDriverImg);
//         return;
//       }

//       const blob = await res.blob();
//       const imageUrl = URL.createObjectURL(blob);
//       setDriverImageSrc(imageUrl);
//     } catch (err) {
//       console.error("❌ Error fetching selfie:", err);
//       setDriverImageSrc(defaultDriverImg);
//     }
//   };

//   fetchSelfie();
// }, [user]);




  // 🔹 Poll backend every few seconds to see if driver accepted
  // 🔹 Fixed Polling Effect — Detects "picked_up" correctly and cleans interval
  useEffect(() => {
    console.log("🧠 Polling effect CHECK:", { currentStep, trackingNumber, user });
    if ((currentStep === 3 || currentStep === 4) && trackingNumber && user) {
      let intervalId;

      const startPolling = async () => {
        const token = await user.getIdToken();

        intervalId = setInterval(async () => {
          try {
            const res = await axios.get(
              `https://jio-yatri-user.onrender.com/api/shipments/tracking/${trackingNumber}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = res.data;
            console.log("🔍 Polling data:", data.status);

            // ✅ Detect if shipment is picked up
            if (data.status === "picked_up") {
              console.warn("⚠️ Shipment has been picked up — navigating to /orders");

              // Navigate first
              navigate("/orders", { replace: true });

              // Reset all states after short delay
              setTimeout(() => {
                localStorage.removeItem("assignedShipment");
                setAssignedShipment(null);
                setTrackingNumber("");
                setSuccess(false);
                setCurrentStep(1);
                setCalculatedCosts({});
                setDistance(0);
                setShipmentData({
                  sender: { name: "", phone: "", email: "", address: { addressLine1: "", coordinates: null } },
                  receiver: { name: "", phone: "", email: "", address: { addressLine1: "", coordinates: null } },
                  parcel: { description: "", images: [] },
                  vehicleType: "TwoWheeler",
                  distance: 0,
                  cost: 0,
                  paymentMethod: "pay_after",
                  isShopOrder: false,
                });
                scrollToTop();
              }, 500);

              clearInterval(intervalId);
              return;
            }

            // ✅ Payment completed
            if (data.payment?.status === "paid") {
              setAssignedShipment(data);
              setSuccess(true);
              setCurrentStep(4);
              localStorage.setItem("assignedShipment", JSON.stringify(data));
              clearInterval(intervalId);
              return;
            }

            // ✅ Driver accepted
            if (data.status === "awaiting_payment" && data.assignedDriver) {
              setAssignedShipment(data);
              localStorage.setItem("assignedShipment", JSON.stringify(data));
            }

            // 🚫 Driver cancelled
            if (data.status === "cancelled") {
              console.warn("🚫 Shipment cancelled by driver!");
              localStorage.removeItem("assignedShipment");
              setAssignedShipment(null);
              setTrackingNumber("");
              setSuccess(false);
              setCurrentStep(1);
              setCalculatedCosts({});
              setDistance(0);
              setShipmentData({
                sender: { name: "", phone: "", email: "", address: { addressLine1: "", coordinates: null } },
                receiver: { name: "", phone: "", email: "", address: { addressLine1: "", coordinates: null } },
                parcel: { description: "", images: [] },
                vehicleType: "TwoWheeler",
                distance: 0,
                cost: 0,
                paymentMethod: "pay_after",
                isShopOrder: false,
              });
              scrollToTop();
              clearInterval(intervalId);
              return;
            }

          } catch (err) {
            console.error("Polling error:", err.message);
          }
        }, 4000);
      };

      startPolling();

      // ✅ Cleanup on unmount or dependency change
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [currentStep, trackingNumber, user, navigate]);



  useEffect(() => {
    const checkShipmentStatus = async () => {
      if (!trackingNumber || !user) return;

      try {
        const token = await user.getIdToken(true); // force fresh token
        const res = await axios.get(
          `https://jio-yatri-user.onrender.com/api/shipments/tracking/${trackingNumber}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { t: Date.now() }, // prevent caching
          }
        );

        const data = res.data;
        console.log("🟢 Live status from backend:", data.status);

        if (data.status?.toLowerCase() === "picked_up") {
          console.log("🚚 Shipment picked up — navigating to /orders");
          navigate("/orders", { replace: true });
        }
      } catch (err) {
        console.error("❌ Failed to fetch live shipment:", err.message);
      }
    };

    // Check once immediately, and then every 5 seconds
    checkShipmentStatus();
    const interval = setInterval(checkShipmentStatus, 5000);

    return () => clearInterval(interval);
  }, [trackingNumber, user, navigate]);








  const handleBackToDetails = () => {
    setShouldAutoProgress(false);
    setCurrentStep(1);
  };
  const handleCall = (phone) => {
    if (!phone) return alert('Phone number not available');
    const cleaned = phone.replace(/\D/g, '');  // just remove non-digits
    window.open(`tel:${cleaned}`, '_self');
  };

 const handleInputChange = (e, type) => {
  const { name, value } = e.target;

  if (name === "phone") {
    // 1️⃣ Remove everything except digits
    let cleaned = value.replace(/\D/g, "");

    // 2️⃣ Keep only the last 10 digits (ignore +91, 91, 0, etc.)
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(-10);
    }

    // 3️⃣ Update state
    setShipmentData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: cleaned,
      },
    }));

    return;
  }

  // For other fields (name, email, etc.)
  setShipmentData((prev) => ({
    ...prev,
    [type]: {
      ...prev[type],
      [name]: value,
    },
  }));
};


  const validateStep1 = () => {
    return (
      shipmentData.sender.name.trim() &&
      shipmentData.sender.phone.trim() &&
      shipmentData.receiver.name.trim() &&
      shipmentData.receiver.phone.trim() &&
      shipmentData.sender.address.addressLine1.trim() &&
      shipmentData.receiver.address.addressLine1.trim() &&
      shipmentData.parcel.description.trim()
    );
  };

  const handleVehicleSelect = (type) => {
    setShipmentData(prev => ({
      ...prev,
      vehicleType: type,
      cost: calculatedCosts[type] || 0
    }));
  };

  // const handlePaymentMethodSelect = (method) => {
  //   setSelectedPaymentMethod(method);
  //   setShipmentData(prev => ({
  //     ...prev,
  //     paymentMethod: method
  //   }));
  // };

  const navigateToAddressSelection = (type) => {
    navigate('/select-address', {
      state: {
        type,
        currentAddress: shipmentData[type].address,
        shipmentData: shipmentData
      }
    });
  };

  const handleImageUpload = (e) => {
    // console.log('Image upload initiated');
    const files = Array.from(e.target.files);
    // console.log('Files selected:', files);

    if (shipmentData.parcel.images.length + files.length > 5) {
      // console.warn('Maximum 5 images allowed');
      setError('You can upload a maximum of 5 images');
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024;
      // console.log(`File validation - ${file.name}:`, {
      //   isImage: file.type.startsWith('image/'),
      //   sizeValid: file.size <= 5 * 1024 * 1024,
      //   isValid
      // });
      return isValid;
    });

    if (validFiles.length !== files.length) {
      // console.warn('Some files were invalid');
      setError('Please upload only images (max 5MB each)');
    }

    if (validFiles.length > 0) {
      // console.log('Adding valid files to state:', validFiles);
      setShipmentData(prev => ({
        ...prev,
        parcel: {
          ...prev.parcel,
          images: [...prev.parcel.images, ...validFiles]
        }
      }));
    }
  };

  const handleDocSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    handleImageUpload({ target: { files } }); // reuse your existing logic
  };


  const removeImage = (index) => {
    // console.log('Removing image at index:', index);
    setShipmentData(prev => {
      const newImages = [...prev.parcel.images];
      newImages.splice(index, 1);
      return {
        ...prev,
        parcel: {
          ...prev.parcel,
          images: newImages
        }
      };
    });
  };

  const calculateDistance = async (isAutomatic = false) => {
    // console.log('Calculating distance...');
    const { sender, receiver } = shipmentData;

    if (!sender.address.coordinates || !receiver.address.coordinates) {
      // console.warn('Missing coordinates for distance calculation');
      if (!isAutomatic) {
        setError('Please select valid addresses for both sender and receiver');
      }
      return false;
    }

    if (!isAutomatic) setIsSubmitting(true);
    setError(null);

    try {
      // console.log('Sending distance calculation request with:', {
      //   origin: sender.address.coordinates,
      //   destination: receiver.address.coordinates
      // });

      const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments/calculate-distance', {
        origin: sender.address.coordinates,
        destination: receiver.address.coordinates
      });

      // console.log('Distance calculation response:', response.data);

      const calculatedDistance = response.data.distance;
      setDistance(calculatedDistance);

      const costs = {};
      vehicleTypes.forEach(vehicle => {
        costs[vehicle.type] = calculatedDistance * vehicle.rate;
      });

      // console.log('Calculated costs:', costs);
      setCalculatedCosts(costs);

      setShipmentData(prev => ({
        ...prev,
        distance: calculatedDistance,
        cost: costs[prev.vehicleType] || 0
      }));

      return true;
    } catch (error) {
      // console.error('Distance calculation failed:', error);
      if (!isAutomatic) {
        setError(error.response?.data?.message || 'Failed to calculate distance');
      }
      return false;
    } finally {
      if (!isAutomatic) setIsSubmitting(false);
    }
  };

  const uploadImagesToServer = async (shipmentId, token) => {
    // console.log('Starting image upload to server for shipment:', shipmentId);
    const formData = new FormData();

    // console.log('Preparing FormData with images:', shipmentData.parcel.images);
    shipmentData.parcel.images.forEach((image, index) => {
      if (image instanceof File) {
        // console.log(`Adding file ${index} to FormData:`, image.name);
        formData.append('images', image); // This must match your Multer field name
      } else {
        // console.log(`Skipping non-File item at index ${index}:`, image);
      }
    });

    try {
      // console.log('Sending image upload request to:', 
      //   `${process.env.REACT_APP_API_URL}/api/shipment-images/${shipmentId}/multiple`);

      const response = await axios.post(
        `https://jio-yatri-user.onrender.com/api/shipment-images/${shipmentId}/multiple`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // console.log('Image upload successful:', response.data);
      return response.data;
    } catch (error) {
      // console.error('Image upload failed:', {
      //   message: error.message,
      //   response: error.response?.data,
      //   config: error.config,
      //   stack: error.stack
      // });
      throw error;
    }
  };

  const processRazorpayPayment = async (shipmentId) => {
    // console.log('Processing Razorpay payment for shipment:', shipmentId);
    if (!shipmentId) {
      // console.error('Invalid shipment ID');
      setError('Invalid shipment ID');
      return;
    }

    setPaymentProcessing(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      // console.log('Initiating payment for shipment:', shipmentId);

      const orderResponse = await axios.post(
        `https://jio-yatri-user.onrender.com/api/payment/${shipmentId}/initiate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      // console.log('Payment initiation response:', orderResponse.data);

      const order = orderResponse.data.data;

      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay not available after script load');
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'MokshaAmbani Logistics',
        description: `Payment for Shipment #${trackingNumber}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              'https://jio-yatri-user.onrender.com/api/payment/verify',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                shipmentId: shipmentId
              },
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
              }
            );

            const updatedShipment = verifyResponse.data.shipment; // ✅ backend returns full updated shipment

            if (verifyResponse.data.success && updatedShipment) {
              setAssignedShipment(updatedShipment);
              setSuccess(true);
              setCurrentStep(4);

              // ✅ Save updated shipment with payment.status = 'paid'
              localStorage.setItem("assignedShipment", JSON.stringify(updatedShipment));
            }
            else {
              throw new Error("Payment verified but shipment data missing");
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setError('Payment verification failed. Please contact support.');
          } finally {
            setPaymentProcessing(false);
          }
        }
        ,
        prefill: {
          name: shipmentData.sender.name,
          email: shipmentData.sender.email || '',
          contact: shipmentData.sender.phone
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            // console.log('Payment modal dismissed');
            setPaymentProcessing(false);
          }
        }
      };

      // console.log('Creating Razorpay instance with options:', options);
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        // console.error('Payment failed:', response);
        setError(`Payment failed: ${response.error.description}`);
        setPaymentProcessing(false);
      });

      rzp.open();

    } catch (error) {
      // console.error('Payment processing error:', error);
      setError(error.response?.data?.message || 'Payment processing failed');
      setPaymentProcessing(false);
    }
  };


  const handleCancelShipment = async (shipmentId) => {
    try {
      const token = await user.getIdToken();
      await axios.put(
        `https://jio-yatri-user.onrender.com/api/shipments/${shipmentId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // alert("Shipment cancelled successfully ✅");

      // 🧹 Clear local storage and reset all relevant state
      localStorage.removeItem("assignedShipment");
      setAssignedShipment(null);
      setTrackingNumber("");
      setSuccess(false);
      setCurrentStep(1);
      setCalculatedCosts({});
      setDistance(0);
      scrollToTop();
    } catch (err) {
      console.error("Cancel shipment failed:", err);
      alert(err.response?.data?.error || "Failed to cancel shipment ❌");
    }
  };

  const handleCancelBeforeAssign = () => {
    const saved = JSON.parse(localStorage.getItem("assignedShipment"));

    if (!saved?._id) {
      alert("Shipment not yet initialized. Please wait a few seconds.");
      return;
    }
    localStorage.removeItem("assignedShipment");

    setPreAssignCancelModal({
      visible: true,
      id: saved._id,
    });
  };



  const handleNextStep = () => {
    // console.log('Moving to next step');
    if (!shipmentData.sender.name || !shipmentData.sender.phone ||
      !shipmentData.receiver.name || !shipmentData.receiver.phone) {
      // console.warn('Missing sender/receiver details');
      setError('Please fill all sender and receiver details');
      return;
    }

    if (!shipmentData.sender.address.addressLine1 || !shipmentData.receiver.address.addressLine1) {
      // console.warn('Missing addresses');
      setError('Please select both pickup and delivery locations');
      return;
    }

    if (!shipmentData.parcel.description) {
      // console.warn('Missing parcel description');
      setError('Please describe your parcel');
      return;
    }

    calculateDistance().then(valid => {
      // console.log('Distance calculation result:', valid);
      if (valid) setCurrentStep(2);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('Form submission started');

    if (!user) {
      // console.log('User not authenticated');
      setError('Please login to create shipments');
      return;
    }

    if (!shipmentData.vehicleType) {
      // console.log('No vehicle type selected');
      setError('Please select a vehicle type');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      // console.log('User token retrieved');

      const payload = {
        sender: {
          name: shipmentData.sender.name,
          phone: shipmentData.sender.phone,
          email: shipmentData.sender.email || '',
          address: {
            addressLine1: shipmentData.sender.address.addressLine1,
            coordinates: shipmentData.sender.address.coordinates
          }
        },
        receiver: {
          name: shipmentData.receiver.name,
          phone: shipmentData.receiver.phone,
          email: shipmentData.receiver.email || '',
          address: {
            addressLine1: shipmentData.receiver.address.addressLine1,
            coordinates: shipmentData.receiver.address.coordinates
          }
        },
        parcel: {
          description: shipmentData.parcel.description
        },
        vehicleType: shipmentData.vehicleType,
        distance: shipmentData.distance,
        cost: shipmentData.cost,
        paymentMethod: shipmentData.paymentMethod,
        shopId: shipmentData.shopId,
        isShopOrder: shipmentData.isShopOrder
      };

      // console.log('Shipment payload:', payload);

      // console.log('Creating shipment...');
      const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const shipmentId = response.data.shipment?._id;
      // console.log('Shipment created with ID:', shipmentId);
      setTrackingNumber(response.data.trackingNumber);

      if (shipmentData.parcel.images.length > 0) {
        // console.log('Starting image upload for', shipmentData.parcel.images.length, 'images');
        await uploadImagesToServer(shipmentId, token);
      } else {
        // console.log('No images to upload');
      }

      // if (shipmentData.paymentMethod === 'pay_after') {
      //   // console.log('Pay after delivery selected, showing success');
      //   setSuccess(true);
      //   setCurrentStep(3);
      //   return;
      // }

      // // console.log('Processing online payment...');
      // await processRazorpayPayment(shipmentId);

      // ✅ User pays only after driver accepts
      // ✅ Save newly created shipment temporarily in localStorage
      localStorage.setItem(
        "assignedShipment",
        JSON.stringify({
          _id: response.data.shipment?._id,
          trackingNumber: response.data.trackingNumber,
          status: "pending",
          cost: shipmentData.cost,
          baseFare: shipmentData.cost,
          distanceFare: 0,
          assignedDriver: null,
        })
      );

      // ✅ Move to step 3 (waiting / payment step)
      setSuccess(true);
      setCurrentStep(3);


    } catch (error) {
      // console.error('Submission error:', {
      //   message: error.message,
      //   response: error.response?.data,
      //   stack: error.stack
      // });
      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to submit shipment. Please try again.'
      );
    } finally {
      // console.log('Submission process completed');
      setIsSubmitting(false);
    }
  };

  if (paymentProcessing) {
    return (
      <div className="payment-processing-overlay">
        <div className="payment-processing-content">
          <div className="payment-processing-spinner"></div>
          <h3>Processing Payment...</h3>
          <p>Please wait while we process your payment</p>
        </div>
      </div>
    );
  }

  // if (currentStep === 3) {
  //   return (
  //     <div className="confirmation-page">
  //       <Header />
  //       <div className="content-wrap">
  //         <div className="confirmation-container">
  //           <div className="success-icon">
  //             <div className="checkmark-circle">
  //               <svg className="checkmark-icon" viewBox="0 0 52 52">
  //                 <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none" />
  //                 <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
  //               </svg>
  //             </div>
  //           </div>
  //           <h1 className="success-title">Order Confirmed!</h1>
  //           <p className="success-subtitle">
  //             Your shipment is created. Please wait — a driver will be assigned shortly.
  //           </p>

  //           <div className="order-id">
  //             <span>Tracking Number: {trackingNumber}</span>
  //           </div>
  //           <div className="payment-method-display">
  //             <span>Payment Method: </span>
  //             <strong>
  //               {shipmentData.paymentMethod === 'razorpay'
  //                 ? 'Online Payment'
  //                 : 'Pay After Delivery'}
  //             </strong>
  //           </div>
  //           <div className="total-summary">
  //             <div className="total-label">Total Amount</div>
  //             <div className="total-amount">₹{shipmentData.cost.toFixed(2)}</div>
  //           </div>
  //           <div className="action-buttons">
  //             <button
  //               className="btn-secondary"
  //               onClick={() => {
  //                 navigate('/home');
  //                 scrollToTop();
  //               }}
  //             >
  //               Back to Home
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (currentStep === 3) {
    // 🔹 If driver already accepted (show animated driver details + payment)
    if (assignedShipment && assignedShipment.status === "awaiting_payment" && assignedShipment.assignedDriver) {
      const driver = assignedShipment.assignedDriver;

      // ✅ Use backend values, rounded to two decimals
      const baseFare = assignedShipment.baseFare
        ? parseFloat(assignedShipment.baseFare.toFixed(2))
        : 0;

      const distanceFare = assignedShipment.distanceFare
        ? parseFloat(assignedShipment.distanceFare.toFixed(2))
        : 0;

      const totalFare = assignedShipment.cost
        ? parseFloat(assignedShipment.cost.toFixed(2))
        : baseFare + distanceFare;
      const driverImageSrc = driver?.userId
        ? `https://jio-yatri-user.onrender.com/api/upload/selfie/${driver.userId}?ts=${Date.now()}`
        : defaultDriverImg;

      return (
        // <div className="confirmation-page accepted">
        //   <Header />
        //   <div className="content-wrap">
        //     <div className="confirmation-container accepted">


        //       <img
        //         src={driverImageSrc}
        //         alt="Driver Selfie"
        //         className="driver-avatar"
        //         onError={(e) => {
        //           // Fallback to default if selfie 404s or fails to load
        //           e.currentTarget.onerror = null; // prevent infinite loop
        //           e.currentTarget.src = defaultDriverImg;
        //         }}
        //       />

        //       <h2 className="driver-phone">+91 {driver?.phone}</h2>
        //       <h1 className="shipment-accepted">Shipment Accepted</h1>
        //       <h1 className="total-amount">₹{totalFare.toFixed(2)}</h1>

        //       <div className="fare-breakdown">
        //         <div className="fare-row">
        //           <span>Base Fare</span>
        //           <span>₹{baseFare.toFixed(2)}</span>
        //         </div>
        //         <div className="fare-row">
        //           <span>Driver Distance Fare</span>
        //           <span>₹{distanceFare.toFixed(2)}</span>
        //         </div>
        //         <hr />
        //         <div className="fare-row total">
        //           <strong>Total Fare</strong>
        //           <strong>₹{totalFare.toFixed(2)}</strong>
        //         </div>
        //       </div>
        //       <button
        //         className="pay-button"
        //         onClick={() => processRazorpayPayment(assignedShipment._id)}
        //       >
        //         Pay ₹{totalFare}
        //       </button>

        //       <div className="razorpay-footer">
        //         <img src="/assets/images/razorpay-logo.png" alt="Razorpay" />
        //       </div>
        //     </div>
        //   </div>
        // </div>
        <div className="confirmation-page accepted">
          <Header />
          <div className="confirmation-container accepted">
            {/* Driver Phone */}
            <div className="driver-img">
              <img
                src={driverImageSrc}
                alt="Driver Selfie"
                className="driver-avatar"
                onError={(e) => {
                  // Fallback to default if selfie 404s or fails to load
                  e.currentTarget.onerror = null; // prevent infinite loop
                  e.currentTarget.src = defaultDriverImg;
                }}
              />
              <h2 className="driver-phone">{driver?.phone}</h2>
              <FaPhone
                  className="call-icons"
                  onClick={() => handleCall(driver?.phone)}
                />
            </div>


            {/* Title */}
            <h1 className="shipment-accepted">Shipment accepted</h1>

            {/* Total Amount */}
            <h1 className="total-amount">₹{totalFare.toFixed(2)}</h1>

            {/* Driver Illustration */}
            {/* <img
          src={driverTruck}
          alt="Driver and Truck"
          className="driver-illustration"
        /> */}
            {/* <Lottie
              animationData={driverAnimation}
              loop={true}
              style={{
                width: 150, height: 100, margin: "0 auto",          // 👈 horizontally center
                display: "block",
              }}
            /> */}


            {/* Fare Breakdown */}
            <div className="fare-breakdown">
              <div className="fare-row">
                <span>Base Fare</span>
                <span>₹{baseFare.toFixed(2)}</span>
              </div>
              <div className="fare-row">
                <span>Distance Fare</span>
                <span>₹{distanceFare.toFixed(2)}</span>
              </div>
              <hr />
              <div className="fare-row total">
                <strong>Total Fare</strong>
                <strong>₹{totalFare.toFixed(2)}</strong>
              </div>
            </div>

            {/* Pay Button */}
            {/* <button
              className="pay-button"
              onClick={() => processRazorpayPayment(assignedShipment._id)}
            >
              Pay ₹{totalFare}
            </button> */}

            {/* Payment Section */}
            <div className="payment-dropdown">
              {!eligibleForCash ? (
                // 🔹 If user has less than 3 completed shipments → Razorpay only
                <button
                  className="pay-button"
                  onClick={() => processRazorpayPayment(assignedShipment._id)}
                >
                  Pay ₹{totalFare}
                </button>
              ) : (
                // 🔹 If user has 3 or more → show dropdown (Razorpay + Cash)
                <>
                  <div className="payment-options">
                    <label className="payment-label">Select Payment Method:</label>

                    <div className="payment-options-inline">
                      <div
                        className={`payment-option ${selectedPayment === "cash" ? "selected" : ""}`}
                        onClick={() => setSelectedPayment("cash")}
                      >
                        <div className="radio-circle">
                          {selectedPayment === "cash" && <span className="checkmark">✔</span>}
                        </div>
                        <span className="payment-text">₹ Cash</span>
                      </div>

                      <div
                        className={`payment-option ${selectedPayment === "razorpay" ? "selected" : ""}`}
                        onClick={() => setSelectedPayment("razorpay")}
                      >
                        <div className="radio-circle">
                          {selectedPayment === "razorpay" && <span className="checkmark">✔</span>}
                        </div>
                        <span className="payment-text">💳 Online</span>
                      </div>
                    </div>

                  </div>


                  <button
                    className="pay-button"
                    onClick={async () => {
                      if (selectedPayment === "razorpay") {
                        processRazorpayPayment(assignedShipment._id);
                      } else {
                        try {
                          const token = await user.getIdToken();
                          const res = await axios.post(
                            `https://jio-yatri-user.onrender.com/api/payment/${assignedShipment._id}/cash`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                          );

                          if (res.data.success) {
                            const updated = {
                              ...assignedShipment,
                              payment: { method: "cash", status: "paid" },
                            };
                            setAssignedShipment(updated);
                            localStorage.setItem("assignedShipment", JSON.stringify(updated));
                            setCurrentStep(4);
                            setSuccess(true);
                          } else {
                            alert("Failed to mark payment as cash");
                          }
                        } catch (err) {
                          console.error("Cash payment failed:", err.message);
                          alert("Cash payment failed");
                        }
                      }
                    }}
                  >
                    {selectedPayment === "razorpay"
                      ? `Pay ₹${totalFare}`
                      : "Confirm Cash Payment"}
                  </button>
                </>
              )}
            </div>


            <button
              className="canceled-shipment-btn"
              onClick={() =>
                setConfirmModal({
                  visible: true,
                  type: "shipment",
                  id: assignedShipment._id
                })
              }
            >
              Cancel Shipment
            </button>

            {/* Razorpay Footer
            <div className="razorpay-footer">
              <img src={razorpayLogo} alt="Razorpay" />
            </div> */}
          </div>

          {confirmModal.visible && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Confirm Cancellation</h3>
                <p>Are you sure you want to cancel this shipment?</p>
                <div className="modal-buttons">
                  <button
                    className="confirm-btn"
                    onClick={async () => {
                      await handleCancelShipment(confirmModal.id);
                      setConfirmModal({ visible: false, type: null, id: null });
                    }}
                  >
                    Yes, Cancel
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() =>
                      setConfirmModal({ visible: false, type: null, id: null })
                    }
                  >
                    No, Go Back
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      );
    }

    // 🔹 Default confirmation (waiting for driver)
    return (
      // <div className="confirmation-page waiting">
      //   <Header />
      //   <div className="content-wrap">
      //     <div className="confirmation-container">
      //       <div className="success-icon">
      //         <div className="checkmark-circle">
      //           <svg className="checkmark-icon" viewBox="0 0 52 52">
      //             <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none" />
      //             <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      //           </svg>
      //         </div>
      //       </div>
      //       <h1 className="success-title">Order Confirmed!</h1>
      //       <p className="success-subtitle">
      //         Your shipment is created. Please wait — a driver will be assigned shortly.
      //       </p>

      //       <div className="order-id">
      //         <span>Tracking Number: {trackingNumber}</span>
      //       </div>
      //       <div className="payment-method-display">
      //         <span>Payment Method: </span>
      //         <strong>
      //           {shipmentData.paymentMethod === "razorpay"
      //             ? "Online Payment"
      //             : "Pay After Delivery"}
      //         </strong>
      //       </div>
      //       <div className="total-summary">
      //         <div className="total-label">Total Amount</div>
      //         <div className="total-amount">₹{shipmentData.cost.toFixed(2)}</div>
      //       </div>
      //       <div className="action-buttons">
      //         <button
      //           className="btn-secondary"
      //           onClick={() => {
      //             navigate("/home");
      //             scrollToTop();
      //           }}
      //         >
      //           Back to Home
      //         </button>
      //       </div>
      //     </div>
      //   </div>
      // </div>
      <div className="confirmation-page waiting">
        <Header />
        <div className="content-wrap">
          <div className="confirmation-container">
            <div className="success-icon">
              <div className="checkmark-circle">
                <svg className="checkmark-icon" viewBox="0 0 52 52">
                  <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
            </div>

            <h1 className="success-title">Booking Confirmed</h1>

            <div className="confirmation-driver">
              {/* <img src={driver} alt="Driver" /> */}
               <Lottie
              animationData={driverAnimation}
              loop={true}
              style={{
                width: 300, height: 150, margin: "0 auto",          // 👈 horizontally center
                display: "block",
              }}
            />
            </div>

            {/* <p className="awaiting-text">Awaiting driver confirmation.</p> */}

            {/* <button
              className="cancel-shipment-btn"
              onClick={() =>
                setConfirmModal({
                  visible: true,
                  type: "shipment",
                  id: assignedShipment._id
                })
              }
            >
              Cancel Shipment
            </button> */}

            <button
              className="cancel-before-assign-btn"
              onClick={handleCancelBeforeAssign}
            >
              Cancel Booking
            </button>





          </div>
        </div>
        {preAssignCancelModal.visible && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Cancel Booking?</h3>
              <p>No driver has been assigned yet. Do you really want to cancel this booking?</p>
              <div className="modal-buttons">
                <button
                  className="confirm-btn"
                  onClick={async () => {
                    await handleCancelShipment(preAssignCancelModal.id);
                    setPreAssignCancelModal({ visible: false, id: null });
                  }}
                >
                  Yes, Cancel
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setPreAssignCancelModal({ visible: false, id: null })}
                >
                  No, Go Back
                </button>
              </div>
            </div>
          </div>
        )}


      </div>

    );
  }

  // if (
  //   currentStep === 4 &&
  //   assignedShipment &&
  //   assignedShipment.status !== "cancelled" 

  // ) {
  //   const driver = assignedShipment.assignedDriver;
  //   const otp = assignedShipment.pickupOtp || "----";


  //   console.log("📦 Sending to LocationTracker:", {
  //     trackingNumber: assignedShipment?.trackingNumber,
  //     senderCoords: assignedShipment?.sender?.address?.coordinates,
  //     receiverCoords: assignedShipment?.receiver?.address?.coordinates,
  //     driverCoords: assignedShipment?.driverLocation?.coordinates,
  //   });


  //   return (
  //     <div className="tracking-view-page">
  //       <Header />

  //       {/* Fixed map area */}
  //       <div className="tracking-view-map">
  //         <LocationTracker shipment={assignedShipment} />
  //       </div>

  //       {/* Scrollable bottom section */}
  //       <div className="tracking-view-scroll">
  //         <div className="tracking-view-card">
  //           <h3 className="tracking-view-status">Sender OTP
  //             <div className="tracking-view-amount">₹{assignedShipment.cost.toFixed(2)}</div>
  //           </h3>



  //           {/* OTP */}
  //           <div className="tracking-view-otp">
  //             {otp.toString().split("").map((d, i) => (
  //               <span key={i} className="tracking-view-otp-digit">{d}</span>
  //             ))}

  //           </div>

  //           {/* Driver Info */}
  //           <div className="tracking-view-driver">
  //             <img
  //               src={`http://localhost:5001/api/upload/selfie/${driver.userId}?ts=${Date.now()}`}
  //               alt="Driver"
  //               className="tracking-view-driver-photo"
  //               onError={(e) => (e.currentTarget.src = defaultDriverImg)}
  //             />
  //             <div className="tracking-view-driver-details">
  //               <>
  //                 <h4>{driver?.name || "Driver"}</h4>
  //                 <p>{driver?.vehicleNumber || "N/A"}</p>
  //               </>

  //               <FaPhone
  //                 className="call-icons"
  //                 onClick={() => handleCall(driver?.phone)}
  //               />



  //               {/* <p>📞{driver?.phone}</p> */}


  //             </div>

  //             {/* 🚫 Cancel Shipment Button */}



  //           </div>

  //           <button
  //             className="cancel-shipment-btn"
  //             onClick={() =>
  //               setConfirmModal({
  //                 visible: true,
  //                 type: "shipment",
  //                 id: assignedShipment._id
  //               })
  //             }
  //           >
  //             Cancel Shipment
  //           </button>

  //           {/* Add more content to test scrolling */}
  //           <div style={{ height: "20px" }}></div>
  //         </div>
  //       </div>

  //       {confirmModal.visible && (
  //         <div className="modal-overlay">
  //           <div className="modal-content">
  //             <h3>Confirm Cancellation</h3>
  //             <p>Are you sure you want to cancel this shipment?</p>
  //             <div className="modal-buttons">
  //               <button
  //                 className="confirm-btn"
  //                 onClick={async () => {
  //                   await handleCancelShipment(confirmModal.id);
  //                   setConfirmModal({ visible: false, type: null, id: null });
  //                 }}
  //               >
  //                 Yes, Cancel
  //               </button>
  //               <button
  //                 className="cancel-btn"
  //                 onClick={() =>
  //                   setConfirmModal({ visible: false, type: null, id: null })
  //                 }
  //               >
  //                 No, Go Back
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       )}



  //     </div>


  //   );
  // }

  if (
    currentStep === 4 &&
    assignedShipment &&
    assignedShipment.status !== "cancelled" &&
    assignedShipment.status !== "picked_up"
  ) {
    const driver = assignedShipment.assignedDriver;
    const otp = assignedShipment.pickupOtp || "----";

    console.log("📦 Sending to LocationTracker:", {
      trackingNumber: assignedShipment?.trackingNumber,
      senderCoords: assignedShipment?.sender?.address?.coordinates,
      receiverCoords: assignedShipment?.receiver?.address?.coordinates,
      driverCoords: assignedShipment?.driverLocation?.coordinates,
    });

    return (
      <div className="tracking-view-page">
        <Header />

        {/* 🗺️ Map Area (same for both types) */}
        <div className="tracking-view-map">
          <LocationTracker shipment={assignedShipment} />
        </div>

        {/* 📦 Scrollable Bottom Section */}
        <div className="tracking-view-scroll">
          <div className="tracking-view-card">

            {/* 🔹 Dynamic Title based on order type */}
            <h3 className="tracking-view-status">
              {assignedShipment.isShopOrder ? "Receiver OTP" : "Sender OTP"}
              <div className="tracking-view-amount">
                ₹{assignedShipment.cost.toFixed(2)}
              </div>
            </h3>

            {/* 🔹 OTP Digits */}
            <div className="tracking-view-otp">
              {otp.toString().split("").map((d, i) => (
                <span key={i} className="tracking-view-otp-digit">{d}</span>
              ))}
            </div>

            {/* 🔹 Driver Info */}
            <div className="tracking-view-driver">
              <img
                src={`https://jio-yatri-user.onrender.com/api/upload/selfie/${driver.userId}?ts=${Date.now()}`}
                alt="Driver"
                className="tracking-view-driver-photo"
                onError={(e) => (e.currentTarget.src = defaultDriverImg)}
              />
              <div className="tracking-view-driver-details">
                <h4>{driver?.name || "Driver"}</h4>
                <p>{driver?.vehicleNumber || "N/A"}</p>

                <FaPhone
                  className="call-icons"
                  onClick={() => handleCall(driver?.phone)}
                />
              </div>
            </div>

            {/* 🔹 Cancel Button */}
            <button
              className="cancel-shipment-btn"
              onClick={() =>
                setConfirmModal({
                  visible: true,
                  type: "shipment",
                  id: assignedShipment._id
                })
              }
            >
              Cancel Shipment
            </button>

          </div>
        </div>

        {/* 🔹 Confirmation Modal */}
        {confirmModal.visible && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Cancellation</h3>
              <p>Are you sure you want to cancel this shipment?</p>
              <div className="modal-buttons">
                <button
                  className="confirm-btn"
                  onClick={async () => {
                    await handleCancelShipment(confirmModal.id);
                    setConfirmModal({ visible: false, type: null, id: null });
                  }}
                >
                  Yes, Cancel
                </button>
                <button
                  className="cancel-btn"
                  onClick={() =>
                    setConfirmModal({ visible: false, type: null, id: null })
                  }
                >
                  No, Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }




  if (currentStep === 1) {
    return (
      <>
        <Header />
        <SecondaryNav />
        <SearchBar />
        <div className="shipment-page rapido-style">
          <div className="shipment-container">
            <h2 className="step-title">Enter Sender & Receiver Details</h2>

            <div className="sender-section">
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  value={shipmentData.sender.name}
                  onChange={(e) => handleInputChange(e, 'sender')}
                  placeholder="Sender Name"
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  value={shipmentData.sender.phone}
                  onChange={(e) => handleInputChange(e, 'sender')}
                  placeholder="Sender Phone"
                  className="form-input"
                />
              </div>
              <div
                className="address-input"
                onClick={() => navigateToAddressSelection('sender')}
              >
                <div style={{ position: 'relative' }} className='location-icon'>
                  <FaMapMarkerAlt className="address-icon" />
                  <input
                    type="text"
                    value={shipmentData.sender.address.addressLine1 || ''}
                    readOnly
                    placeholder="Parcel Pickup location"
                    className="address-text"
                  />
                </div>
              </div>
            </div>

            <div className="parcel-section">
              <div className="input-groups">
                <textarea
                  name="description"
                  value={shipmentData.parcel.description}
                  onChange={(e) => setShipmentData(prev => ({
                    ...prev,
                    parcel: {
                      ...prev.parcel,
                      description: e.target.value
                    }
                  }))}
                  placeholder="Order Description"
                  className="form-textarea"
                  rows={1}
                />
              </div>

              {/* <div className="image-upload-section">
                <label className="image-upload-label">
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div> */}

              <div className="image-upload-section">
                {/* When clicked, open the bottom-sheet options */}
                <label
                  className="image-upload"
                  onClick={() => setShowUploadOptions(true)}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </label>

                {/* Hidden inputs for Camera and Gallery */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  id="cameraInput"
                  style={{ display: 'none' }}
                  onChange={(e) => handleDocSelect(e)}
                />

                <input
                  type="file"
                  accept="image/*"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={(e) => handleDocSelect(e)}
                />
              </div>


            </div>
            <div className="image-preview-container">
              {shipmentData.parcel.images.map((image, index) => (
                <div key={index} className="image-preview-item">
                  <img
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`Parcel ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="receiver-section">
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  value={shipmentData.receiver.name}
                  onChange={(e) => handleInputChange(e, 'receiver')}
                  placeholder="Receiver Name"
                  className="form-input"
                />
              </div>
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  value={shipmentData.receiver.phone}
                  onChange={(e) => handleInputChange(e, 'receiver')}
                  placeholder="Receiver Phone"
                  className="form-input"
                />
              </div>
              <div
                className="address-input"
                onClick={() => navigateToAddressSelection('receiver')}
              >
                <div style={{ position: 'relative' }} className='location-icon'>
                  <FaMapMarkerAlt className="address-icon" />
                  <input
                    type="text"
                    value={shipmentData.receiver.address.addressLine1 || ''}
                    readOnly
                    placeholder="Parcel Delivery location"
                    className="address-text"
                  />
                </div>
              </div>
            </div>

            <div className="map-preview">
              <LocationMap
                senderCoordinates={shipmentData.sender.address.coordinates}
                receiverCoordinates={shipmentData.receiver.address.coordinates}
                currentLocation={currentLocation}
              />
            </div>

            <h6 className='services'>Services</h6>
            <div className="vehicle-options-container">
              {vehicleTypes.map((vehicle) => (
                <div
                  key={vehicle.type}
                  className={`vehicle-option ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''} ${!vehicle.available ? 'unavailable' : ''}`}
                  onClick={() => vehicle.available && handleVehicleSelect(vehicle.type)}
                >
                  <div className="vehicle-icons">{vehicle.emoji}</div>
                  <div className="vehicle-info">
                    <div className="vehicle-name">{vehicle.name}</div>
                    <div className="vehicle-capacity">{vehicle.capacity}</div>
                  </div>
                  <div className="vehicle-rate">{vehicle.displayRate}</div>
                  {shipmentData.distance > 0 && (
                    <div className="vehicle-price">₹{(shipmentData.distance * vehicle.rate).toFixed(2)}</div>
                  )}
                  {vehicle.comingSoon && <div className="coming-soon">Coming Soon</div>}
                </div>
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="next-button"
              onClick={handleNextStep}
              disabled={isSubmitting || !validateStep1()}
            >
              {isSubmitting ? 'Calculating...' : 'Continue'}
            </button>
          </div>
        </div>
        {showUploadOptions && (
          <div
            className="upload-bottomsheet-overlay"
            onClick={() => setShowUploadOptions(false)}
          >
            <div
              className="upload-bottomsheet"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Select Upload Option</h3>
              <div className="media">
                <div className="camera">
                  <button
                    className="upload-options"
                    onClick={() => {
                      document.getElementById("cameraInput").click();
                      setShowUploadOptions(false);
                    }}
                  >
                    📷
                  </button>
                  <p>Camera</p>
                </div>

                <div className="files">
                  <button
                    className="upload-options"
                    onClick={() => {
                      document.getElementById("fileInput").click();
                      setShowUploadOptions(false);
                    }}
                  >
                    📂
                  </button>
                  <p>Media picker</p>
                </div>
              </div>

              <button
                className="upload-cancel"
                onClick={() => setShowUploadOptions(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="shipment-page rapido-style">
        <Header />
        <div className="map-preview">
          <LocationMap
            senderCoordinates={shipmentData.sender.address.coordinates}
            receiverCoordinates={shipmentData.receiver.address.coordinates}
            currentLocation={currentLocation}
          />

          <div className="button-group">
            <button className="back-buttons" onClick={handleBackToDetails}>
              ←
            </button>
          </div>
        </div>
        <div className="shipment-container">
          <h2 className="step-title">Select Vehicle & Payment</h2>

          <div className="vehicle-selection-section">
            <h3 className="section-vehicle-title">Choose Your Vehicle</h3>
            <div className="vehicle-options-container">
              {vehicleTypes.map((vehicle) => (
                <div
                  key={vehicle.type}
                  className={`vehicle-option ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''} ${!vehicle.available ? 'unavailable' : ''}`}
                  onClick={() => vehicle.available && handleVehicleSelect(vehicle.type)}
                >
                  <div className="vehicle-icons">{vehicle.emoji}</div>
                  <div className="vehicle-info">
                    <div className="vehicle-name">{vehicle.name}</div>
                    <div className="vehicle-capacity">{vehicle.capacity}</div>
                  </div>
                  {shipmentData.distance > 0 && (
                    <div className="vehicle-price">₹{(shipmentData.distance * vehicle.rate).toFixed(2)}</div>
                  )}
                  {vehicle.comingSoon && <div className="coming-soon">Coming Soon</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-item">
              <span className="summary-label">Distance:</span>
              <span className="summary-value">{shipmentData.distance.toFixed(2)} km</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Vehicle:</span>
              <span className="summary-value">
                {vehicleTypes.find(v => v.type === shipmentData.vehicleType)?.name}
              </span>
            </div>
            <div className="summary-item total">
              <span className="summary-label">Total Cost:</span>
              <span className="summary-value">₹{shipmentData.cost.toFixed(2)}</span>
            </div>
          </div>

          {/* <div className="payment-section">
            <h3 className="section-vehicle-title">Payment Method</h3>

            <div className="dropdown-payment-selector">
              <div
                className="selected-payment"
                onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
              >
                <span className="payment-icon">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
                </span>
                <span className="payment-name">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                </span>
                <span className={`dropdown-arrow ${isPaymentDropdownOpen ? 'open' : ''}`}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>

              {isPaymentDropdownOpen && (
                <div className="payment-options-dropdown">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className={`payment-option ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                      onClick={() => {
                        handlePaymentMethodSelect(method.id);
                        setIsPaymentDropdownOpen(false);
                      }}
                    >
                      <span className="payment-icon">{method.icon}</span>
                      <span className="payment-name">{method.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="confirm-button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Book Vehicle'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div> */}
          <div className="payment-section">
            <h3 className="section-vehicle-title">Confirm Booking</h3>

            <button
              className="confirm-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Book Vehicle'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {/* <p className="note">
    💡 You’ll be asked to pay online **only after the driver accepts** your shipment.
  </p> */}
          </div>

        </div>
      </div>
    );
  }






  return null;
}

export default ShipmentPage;
