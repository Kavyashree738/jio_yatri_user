import bikeImg from '../assets/images/vehicles/two-wheeler.png';
import autoImg from '../assets/images/vehicles/three-wheeler.png';
import truckImg from '../assets/images/vehicles/truck.png';
import bularaImg from '../assets/images/vehicles/bulara.png';
import tata407Img from '../assets/images/vehicles/tata-407.png';
import containerImg from '../assets/images/vehicles/truck.png';



export const VEHICLE_TYPES = [
  { 
    type: 'TwoWheeler',
    name: 'Bike',
    img: bikeImg,
    capacity: 'Up to 15 kg',
    rate: 10,
    rateFor2Km: 20,
    displayRate: '₹20 per 2 km',
    available: true,
    comingSoon: false 
  },

  { 
    type: 'ThreeWheeler',
    name: 'Auto',
    img: autoImg,
    capacity: 'Up to 250 kg',
    rate: 20,
    rateFor2Km: 40,
    displayRate: '₹40 per 2 km',
    available: true,
    comingSoon: false 
  },

  { 
    type: 'Truck',
    name: 'Truck',
    img: truckImg,
    capacity: 'Up to 2 tons',
    rate: 40,
    rateFor2Km: 80,
    displayRate: '₹80 per 2 km',
    available: true,
    comingSoon: false 
  },

  { 
    type: 'Pickup9ft',
    name: 'Bulara',
    img: bularaImg,
    capacity: '9 ft bed',
    rate: 175,
    rateFor2Km: 350,
    displayRate: '₹350 per 2 km',
    available: true,
    comingSoon: false 
  },

  { 
    type: 'Tata407',
    name: 'Tata 407',
    img: tata407Img,
    capacity: 'Up to 2.5 t',
    rate: 300,
    rateFor2Km: 600,
    displayRate: '₹600 per 2 km',
    available: true,
    comingSoon: false 
  },

  // Add container when the image is ready
  {
    type: 'ContainerTruck',
    name: 'Container Truck',
    img: containerImg,  
    capacity: '—',
    rate: 80,
    rateFor2Km: 160,
    displayRate: '₹160 per 2 km',
    available: false,
    comingSoon: true
  },
];

export const getVehicleByType = (t) =>
  VEHICLE_TYPES.find(v => v.type === t) || VEHICLE_TYPES[0];
