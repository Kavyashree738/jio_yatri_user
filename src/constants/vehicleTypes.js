export const VEHICLE_TYPES = [
  { type: 'TwoWheeler',   name: 'Bike',     emoji: '🏍️', capacity: 'Up to 15 kg',   rate: 30,  rateFor2Km: 60,  displayRate: '₹60 per 2 km',  available: true,  comingSoon: false },
  { type: 'ThreeWheeler', name: 'Auto',     emoji: '🛺', capacity: 'Up to 250 kg',  rate: 40,  rateFor2Km: 80,  displayRate: '₹80 per 2 km',  available: true,  comingSoon: false },
  { type: 'Truck',        name: 'Truck',    emoji: '🛻', capacity: 'Up to 2 tons',  rate: 60,  rateFor2Km: 120,  displayRate: '₹120 per 2 km',  available: true,  comingSoon: false },
  { type: 'Pickup9ft',    name: 'bulara',   emoji: '🚛', capacity: '9 ft bed',      rate: 175, rateFor2Km: 350, displayRate: '₹350 per 2 km', available: true,  comingSoon: false },
  { type: 'Tata407',      name: 'Tata 407', emoji: '🚒', capacity: 'Up to 2.5 t',   rate: 300, rateFor2Km: 600, displayRate: '₹600 per 2 km', available: true,  comingSoon: false },
  // { type: 'ContainerTruck', name: 'Container Truck', emoji: '🚛', capacity: '—', rate: 80, rateFor2Km: 160, displayRate: '₹160 per 2 km', available: false, comingSoon: true },
];

export const getVehicleByType = (t) =>
  VEHICLE_TYPES.find(v => v.type === t) || VEHICLE_TYPES[0];
