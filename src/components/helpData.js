// src/components/helpData.js
export const helpTopics = [
  {
    id: 1,
    main: "Know how to book a vehicle?",
    related: [
      { q: "How to select pickup and drop location?", a: "Open the JioYatri app, enter pickup and drop addresses manually or use current location." },
      { q: "How to choose vehicle type?", a: "You can select from Auto, Two Wheeler, Pickup9ft, or Truck based on your parcel size." },
      { q: "How to confirm booking?", a: "After selecting locations and vehicle, click on 'Book Now' to confirm." },
      { q: "Can I cancel a ride?", a: "Yes, you can cancel before and after the driver accepts the ride without any charges." },
      { q: "How to contact driver?", a: "Once booking is accepted, you can call your driver from the app." },
    ],
  },
  {
    id: 2,
    main: " Know how to book a shop order?",
    related: [
      { q: "How to find shops?", a: "Go to 'Shops' tab to browse nearby registered shops like groceries, hotels, or bakeries." },
      { q: "How to add items?", a: "Select the shop, choose items, and add them to cart." },
      { q: "How to pay the shop?", a: "Payments go directly to the shop’s UPI ID saved during registration." },
      { q: "Who delivers the items?", a: "Our verified drivers will pick up your order and deliver to your address." },
      { q: "How to track order?", a: "You can track the live location of the driver using the location provided in the map" },
    ],
  },
  {
    id: 3,
    main: " Know about payment process?",
    related: [
      { q: "How to pay driver?", a: "Delivery fee is paid directly to the driver via the app or cash on delivery." },
      { q: "How shop payments work?", a: "You pay the shop owner’s UPI directly for the item amount.and the delivery amount pay to the driver" },
      { q: "Do you support Razorpay?", a: "Yes, Razorpay handles our online secure payments." },
      { q: "Is there any hidden charge?", a: "Yes, along with the delivery fees based on the distance from the sender’s location to the delivery location, the amount the driver should receive will come from your sender location." },
    ],
  },
  {
    id: 4,
    main: " Know how parcel delivery works?",
    related: [
      { q: "How driver collects parcel?", a: "Driver receives pickup OTP from sender before collecting the parcel." },
      { q: "How receiver confirms delivery?", a: "Receiver shares OTP with driver after receiving the parcel." },
      { q: "What if driver delays?", a: "You can track live status or report delay from the help section." },
      { q: "Can I send fragile items?", a: "Yes, but please ensure safe packaging to avoid damage." },
    ],
  },
 
  {
    id: 5,
    main: "Know how delivery charges are calculated?",
    related: [
      { q: "What factors affect cost?", a: "Charges depend on distance, vehicle type, and weight of goods." },
      { q: "Do you charge extra for waiting?", a: "No, as of now we are not charging for that" },
      { q: "Can I get estimated fare?", a: "Yes, estimated fare appears before confirming the booking." },
    ],
  },
  {
    id: 6,
    main: "Know how to register your shop or business?",
    related: [
      { q: "Where to register?", a: "Open Partner App, select 'Register as Business'." },
      { q: "What details are needed?", a: "Provide shop name, category, address, UPI ID, and photos." },
      { q: "Can I edit shop details?", a: "Yes, go to Profile → Edit Shop Info." },
    ],
  },
  {
    id: 7,
    main: "Know what to do if your delivery is delayed?",
    related: [
      { q: "Why delay happens?", a: "Delays can occur due to traffic or weather conditions." },
      { q: "How to report delay?", a: "you can call to helpline number displayed in our app" },
      { q: "Will I get refund?", a: "Refund depends on case review if the order was prepaid." },
    ],
  },
  {
    id: 8,
    main: " Need help or want to contact support?",
    related: [
      { q: "How to contact support?", a: "Email us at helpjioyatri@gmail.com or call 9844559599." },
      { q: "Support hours?", a: "Available Mon–Fri, 9:00 AM – 6:00 PM." },
    ],
  },
];
