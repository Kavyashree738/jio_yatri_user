import React, { useState } from 'react';
import SenderInfo from './SenderInfo';
import ReceiverInfo from './ReceiverInfo';
import VehicleSelection from './VehicleSelection';
import Summary from './Summary';

function DeliveryFlow() {
  const [currentStep, setCurrentStep] = useState('sender');
  const [shipmentData, setShipmentData] = useState({
    sender: {
      name: '',
      phone: '',
      email: '',
      address: null
    },
    receiver: {
      name: '',
      phone: '',
      email: '',
      address: null
    },
    vehicleType: 'car',
    distance: 0,
    cost: 0
  });

  const updateSenderData = (data) => {
    setShipmentData(prev => ({
      ...prev,
      sender: { ...prev.sender, ...data }
    }));
  };

  const updateReceiverData = (data) => {
    setShipmentData(prev => ({
      ...prev,
      receiver: { ...prev.receiver, ...data }
    }));
  };

  const updateVehicleData = (vehicleType) => {
    setShipmentData(prev => ({
      ...prev,
      vehicleType
    }));
  };

  const updateDistanceAndCost = (distance, cost) => {
    setShipmentData(prev => ({
      ...prev,
      distance,
      cost
    }));
  };

  return (
    <div className="delivery-flow">
      {currentStep === 'sender' && (
        <SenderInfo
          data={shipmentData.sender}
          updateData={updateSenderData}
          onNext={() => setCurrentStep('receiver')}
        />
      )}

      {currentStep === 'receiver' && (
        <ReceiverInfo
          data={shipmentData.receiver}
          updateData={updateReceiverData}
          onNext={() => setCurrentStep('vehicle')}
          onBack={() => setCurrentStep('sender')}
        />
      )}

      {currentStep === 'vehicle' && (
        <VehicleSelection
          vehicleType={shipmentData.vehicleType}
          updateData={updateVehicleData}
          updateDistanceAndCost={updateDistanceAndCost}
          senderAddress={shipmentData.sender.address}
          receiverAddress={shipmentData.receiver.address}
          onNext={() => setCurrentStep('summary')}
          onBack={() => setCurrentStep('receiver')}
        />
      )}

      {currentStep === 'summary' && (
        <Summary
          shipmentData={shipmentData}
          onBack={() => setCurrentStep('vehicle')}
          onSubmit={() => console.log('Order submitted!')}
        />
      )}
    </div>
  );
}

export default DeliveryFlow;