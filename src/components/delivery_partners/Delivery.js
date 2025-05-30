import React from 'react'
import '../../components/delivery_partners/DeliveryPartnerForm'
import DeliveryPartnerForm from '../../components/delivery_partners/DeliveryPartnerForm'
import Header from '../pages/Header'
import PorterAdvantage from './PorterAdvantage'
import OwnVehiclesSection from './OwnVehiclesSection'
import EnterpriseFAQ from '../enterprise/EnterpriseFAQ'
import Footer from '../pages/Footer'
const Delivery = () => {
  return (
    <div>
        <Header/>
        <DeliveryPartnerForm/>
        <PorterAdvantage/>
        <OwnVehiclesSection/>
        <EnterpriseFAQ/>
        
        <Footer/>
    </div>
  )
}

export default Delivery
