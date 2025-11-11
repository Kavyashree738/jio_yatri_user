import React, { useEffect, useState, useCallback } from "react";
import Header from "./Header";
import "../../styles/Home.css";
import axios from "axios";
import HeroSection from "./HeroSection";
import WelcomeSection from "./WelcomeSection";
import ServiceSection from "./ServiceSection";
import TestimonialsSection from "./TestimonialsSection";
import Footer from "./Footer";
import Contact from "./Contact";
import PorterPromo from "./PorterPromo";
import NetworkSection from "./NetworkSection";
import WhyChoosePorter from "./WhyChoosePorter";
import FAQSection from "./FAQSection";
import BookingPorterSection from "./BookingPorterSection";
import HelpCenter from "./HelpCenter";
import HouseShiftingFeatures from "./HouseShiftingFeatures";
import ShipmentPage from "./ShipmentPage";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import CallOwner from "../CallOwner";
import "../../styles/FrontShipment.css";
import RatingReminder from "../RatingReminder";
import ShopOrderTrackingCard from "../ShopOrderTrackingCard";
import HelplineButton from "./HelplineButton";

const API_BASE = "https://jio-yatri-user.onrender.com";

const Home = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shopOrderAwaiting, setShopOrderAwaiting] = useState(null);

  /* Helper for consistent debug logging */
  // const dbg = (...args) => console.log("[Home]", ...args);

  // Log when user changes
  useEffect(() => {
    // dbg("Auth user changed:", user ? { uid: user.uid, email: user.email } : "null");
  }, [user]);




  /* ---------------- Fetch regular shipments ---------------- */
  const fetchShipments = useCallback(async () => {
    if (!user) {
      // dbg("Skip fetchShipments: user not logged in");
      return;
    }
    try {
      setLoading(true);
      // dbg("Fetching regular shipments …");
      const token = await auth.currentUser.getIdToken(true);
      // dbg("Token (first 20 chars):", token.substring(0, 20) + "…");

      const url = "https://jio-yatri-user.onrender.com/api/shipments/my-shipments";
      // dbg("GET", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // dbg("✅ Shipments response:", {
      //   count: response.data?.length || 0,
      //   first: response.data?.[0]?._id,
      // });

      setShipments(response.data || []);
    } catch (err) {
      // dbg("❌ Failed to fetch shipments:", err.message);
      if (err.response)
        // dbg("Response:", err.response.status, err.response.data);
        setError("Failed to fetch shipments.");
    } finally {
      // dbg("fetchShipments → done");
      setLoading(false);
    }
  }, [user]);

  /* ---------------- Fetch shop order awaiting payment ---------------- */
  const fetchShopOrder = useCallback(async () => {
    if (!user) {
      // dbg("Skip fetchShopOrder: user not logged in");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken(true);
      // dbg("Fetching shop order (token prefix):", token.substring(0, 20) + "…");

      const url = `${API_BASE}/api/shipments/my-latest`;
      // dbg("GET", url);

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // dbg("✅ Shop order response:", {
      //   id: res.data?._id,
      //   trackingNumber: res.data?.trackingNumber,
      //   status: res.data?.status,
      //   isShopOrder: res.data?.isShopOrder,
      // });

      if (
        res.data &&
        (
          res.data.status === "awaiting_payment" ||
          (res.data.status === "picked_up" && res.data.payment?.status !== "paid")
        )
      ) {
        setShopOrderAwaiting(res.data); // ✅ show
      } else {
        setShopOrderAwaiting(null); // ❌ hide
      }


    } catch (err) {
      // dbg("❌ Error fetching shop order:", err.message);
      if (err.response) {
        // dbg("Response:", err.response.status, err.response.data);
        if (err.response.status === 404) setShopOrderAwaiting(null);
      }
    }
  }, [user]);

  /* ---------------- Initial fetch ---------------- */
  useEffect(() => {
    // dbg("Home mounted → triggering initial fetches");
    fetchShipments();
    fetchShopOrder();
  }, [fetchShipments, fetchShopOrder]);


  /* ---------------- Poll every few seconds for shop order status ---------------- */
  useEffect(() => {
    if (!user) return;

    // dbg("🔁 Starting simple polling using fetchShopOrder()…");

    const interval = setInterval(() => {
      fetchShopOrder(); // ✅ re-use your existing function
    }, 4000); // every 4 seconds

    return () => {
      // dbg("🧹 Clearing polling interval");
      clearInterval(interval);
    };
  }, [user, fetchShopOrder]);

  /* ---------------- Pending ratings ---------------- */
  const pendingRatings = shipments.filter(
    (s) =>
      s.status === "delivered" &&
      s.payment?.status === "paid" &&
      !s.rating?.value
  );

  // dbg("Render start → shopOrderAwaiting:", !!shopOrderAwaiting, "loading:", loading);

  /* ---------------- Render ---------------- */
  return (
    <div className="home-page">
      <Header />
      {!user && <HeroSection />}

      <div className="front-shipment-wrapper">
        {/* Show ShopOrderTrackingCard if an awaiting_payment shop order exists */}
        {/* Always show ShipmentPage by default */}
        {/* Only show one at a time */}
{user && !loading && (
  shopOrderAwaiting ? (
    <ShopOrderTrackingCard order={shopOrderAwaiting} />
  ) : (
    <ShipmentPage />
  )
)}


        {/* Then, if a shop order is detected, show the card (replaces or overlays it) */}
       



        {/* Rating Reminder */}
        {user && !loading && (
          <RatingReminder
            pendingRatings={pendingRatings}
            token={user?.token}
            refreshShipments={fetchShipments}
          />
        )}
      </div>

      {/* <CallOwner /> */}
      <HelplineButton />
      <WelcomeSection />
      <HelpCenter />
      <WhyChoosePorter />
      {/* <PorterPromo /> */}
      {/* <BookingPorterSection /> */}
      <TestimonialsSection />
      <NetworkSection />
      <HouseShiftingFeatures />
      <Contact />
      {/* <FAQSection /> */}
      <Footer />
    </div>
  );
};

export default Home;
