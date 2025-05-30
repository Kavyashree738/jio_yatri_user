import React, { useState } from 'react';
import '../../styles/components.css';
import SenderInfo from '../../components/SenderInfo';
import ReceiverInfo from '../../components/ReceiverInfo';
import VehicleSelection from '../../components/VehicleSelection';
import Summary from '../../components/Summary';
import Header from '../../components/pages/Header'
import Footer from '../../components/pages/Footer'
const steps = ['Sender', 'Receiver', 'Vehicle', 'Review'];

function ShipmentPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [shipmentData, setShipmentData] = useState({
    sender: {},
    receiver: {},
    vehicleType: '',
    distance: 0,
    cost: 0
  });

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  const updateShipmentData = (key, value) => {
    setShipmentData(prev => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <SenderInfo 
            data={shipmentData.sender}
            updateData={(data) => updateShipmentData('sender', data)}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <ReceiverInfo 
            data={shipmentData.receiver}
            updateData={(data) => updateShipmentData('receiver', data)}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <VehicleSelection
            vehicleType={shipmentData.vehicleType}
            updateData={(type) => updateShipmentData('vehicleType', type)}
            updateDistanceAndCost={(distance, cost) => {
              updateShipmentData('distance', distance);
              updateShipmentData('cost', cost);
            }}
            senderAddress={shipmentData.sender.address}
            receiverAddress={shipmentData.receiver.address}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <Summary
            shipmentData={shipmentData}
            onBack={handleBack}
            onSubmit={handleNext}
          />
        );
      default:
        return null;
    }
  };

  return (
   <>
   <Header/>
    <div className="shipment-container">
      
      
      <div className="stepper">
        {steps.map((step, index) => (
          <div 
            key={step} 
            className={`step ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'completed' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{step}</div>
          </div>
        ))}
      </div>

      <div className="form-content">
        {activeStep === steps.length ? (
          <div className="success-message">
            <h2>Thank you for your order!</h2>
            <p>Your shipment has been created. Our porter will contact you shortly.</p>
          </div>
        ) : (
          renderStep()
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default ShipmentPage;