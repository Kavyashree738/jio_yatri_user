import React from 'react'
import Header from "../pages/Header";
import Footer from "../pages/Footer";
import EnterpriseForm from './EnterpriseForm'
import NetworkSection from '../pages/NetworkSection';
import GroupedCitiesAndDistricts from '../pages/GroupedCitiesAndDistricts';
import IndustriesSection from './IndustriesSection';
import EnterpriseFAQ from './EnterpriseFAQ';
const Enterprise = () => {
  return (
    <div>
      <Header/>
      <EnterpriseForm/>
      <NetworkSection/>
      <GroupedCitiesAndDistricts/>
      <IndustriesSection/>
      <EnterpriseFAQ/>
      <Footer/>
    </div>
  )
}

export default Enterprise
