// src/pages/Cart.jsx
import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { MdDelete } from "react-icons/md";
import { VEHICLE_TYPES, getVehicleByType } from '../constants/vehicleTypes';
import '../styles/Cart.css';
import { auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import Header from './pages/Header';
import Footer from './pages/Footer';
const apiBase = 'https://jio-yatri-user.onrender.com';

/* -------------------- Helpers -------------------- */
const isAndroid = () => /Android/i.test(navigator.userAgent);
const isMobile  = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Simple UPI VPA shape check
const isValidVpa = (v) => /^[a-z0-9.\-_]{2,}@[a-z]{2,}$/i.test(String(v || '').trim());

function toUpiParamString({ pa, pn, am, tn }) {
  const p = new URLSearchParams();
  p.set('pa', pa);
  if (pn) p.set('pn', pn);
  p.set('am', (Number(am) || 0).toFixed(2));
  p.set('cu', 'INR');
  if (tn) p.set('tn', tn);
  return p.toString();
}
function makeUpiUri(paramStr) {
  return `upi://pay?${paramStr}`;
}
// Android Intent URI (preferred on Chrome/Android)
function makeAndroidIntentUri(paramStr, { packageName, playStoreUrl, fallbackWebUrl } = {}) {
  const parts = [
    `intent://pay?${paramStr}#Intent`,
    'scheme=upi',
    packageName ? `package=${packageName}` : null,
    playStoreUrl ? `S.browser_fallback_url=${encodeURIComponent(playStoreUrl)}` :
    (fallbackWebUrl ? `S.browser_fallback_url=${encodeURIComponent(fallbackWebUrl)}` : null),
    'end'
  ].filter(Boolean);
  return parts.join(';');
}

/* -------------------- Page -------------------- */
export default function CartPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { cart, setQty, removeItem, clearShopCart } = useCart();
  const bucket = cart[shopId];

  const [placing, setPlacing] = useState(false);
  const { token: ctxToken } = useAuth();

  // Delivery/pricing
  const [shopCoords, setShopCoords] = useState(null); // {lat,lng}
  const [distanceKm, setDistanceKm] = useState(0);
  const [vehicleType, setVehicleType] = useState('TwoWheeler');
  const [costsByVehicle, setCostsByVehicle] = useState({});
  const [estimatedDelivery, setEstimatedDelivery] = useState(0);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    lat: null,
    lng: null,
    notes: ''
  });

useEffect(() => {
  let isMounted = true;

  const hasCoords =
    bucket?.shop?.address?.coordinates?.lat != null &&
    bucket?.shop?.address?.coordinates?.lng != null;

  const hasVpa = !!bucket?.shop?.upiId;

  // If we already have both coords and upiId, set coords and stop
  if (hasCoords && hasVpa) {
    const { lat, lng } = bucket.shop.address.coordinates;
    setShopCoords({ lat, lng });
    return () => { isMounted = false; };
  }

  async function fetchShop() {
    try {
      const res = await axios.get(`${apiBase}/api/shops/${shopId}`);
      const s = res.data?.data || res.data;

      // Merge fresh shop data (this brings in upiId too)
      if (bucket && s) {
        bucket.shop = { ...(bucket.shop || {}), ...s };
      }

      // Derive coordinates (support legacy location array)
      const lat = s?.address?.coordinates?.lat ?? s?.location?.coordinates?.[1];
      const lng = s?.address?.coordinates?.lng ?? s?.location?.coordinates?.[0];
      if (isMounted && lat != null && lng != null) {
        setShopCoords({ lat, lng });
      }
    } catch (e) {
      console.warn('Could not fetch shop:', e?.response?.data || e.message);
    }
  }

  // Fetch if either coords or UPI is missing
  if (shopId && (!hasCoords || !hasVpa)) {
    fetchShop();
  } else if (hasCoords) {
    // we had coords but missed calling setShopCoords before
    const { lat, lng } = bucket.shop.address.coordinates;
    setShopCoords({ lat, lng });
  }

  return () => { isMounted = false; };
}, [shopId, bucket]); // keep deps simple

  // ---- compute distance & prices ----
  useEffect(() => {
    async function calc() {
      if (!shopCoords || form.lat == null || form.lng == null) return;

      try {
        const resp = await axios.post(`${apiBase}/api/shipments/calculate-distance`, {
          origin: { lat: shopCoords.lat, lng: shopCoords.lng },
          destination: { lat: form.lat, lng: form.lng }
        });
        const km = Number(resp.data?.distance || 0);
        setDistanceKm(km);

        const costs = {};
        VEHICLE_TYPES.forEach(v => {
          costs[v.type] = +(km * v.rate).toFixed(2);
        });
        setCostsByVehicle(costs);

        const selected = getVehicleByType(vehicleType);
        setEstimatedDelivery(costs[selected.type] || 0);
      } catch (e) {
        console.error('distance calc failed:', e?.response?.data || e.message);
      }
    }
    calc();
  }, [shopCoords, form.lat, form.lng, vehicleType]);

  // ---- Address selection ----
  const onAddressSelect = ({ address, coordinates }) => {
    setForm(f => ({
      ...f,
      address: address || '',
      lat: coordinates?.lat ?? null,
      lng: coordinates?.lng ?? null
    }));
  };

  // ---- items pricing (delivery separate) ----
  const pricing = useMemo(() => {
    if (!bucket) return { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 };
    const subtotal = bucket.items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    const tax = 0;
    const deliveryFee = 0;
    const total = +(subtotal + tax + deliveryFee).toFixed(2);
    return { subtotal, tax, deliveryFee, total };
  }, [bucket]);

  // ---- vehicle cards ----
  const vehicleCards = useMemo(() => {
    return VEHICLE_TYPES.map(v => ({
      ...v,
      price: distanceKm > 0 ? +(distanceKm * v.rate).toFixed(2) : null,
    }));
  }, [distanceKm]);

  // ---- UPI links (uses exact shop.upiId) ----
  const upiUi = useMemo(() => {
    const shop = bucket?.shop || {};
    const shopName = shop?.shopName || 'Shop';

    // Use only the explicit, verified VPA from DB
    const vpa = isValidVpa(shop?.upiId) ? shop.upiId.trim() : null;

    const amount = Number(pricing.total || 0);
    const note = `Order at ${shopName}`;

    if (!vpa || amount <= 0) {
      return { ready: false, reason: !vpa ? 'MISSING_VPA' : 'ZERO_AMOUNT' };
    }

    const paramStr = toUpiParamString({ pa: vpa, pn: shopName, am: amount, tn: note });
    const upiUrl = makeUpiUri(paramStr);

    // Android: directly open PhonePe
    const phonePeIntent = makeAndroidIntentUri(paramStr, {
      packageName: 'com.phonepe.app',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.phonepe.app'
    });

    // Android: system chooser for any UPI app
    const upiChooserIntent = makeAndroidIntentUri(paramStr);

    return {
      ready: true,
      vpa,
      amount,
      upiUrl,
      phonePeIntent,
      upiChooserIntent,
      shopName
    };
  }, [bucket, pricing.total]);

  if (!bucket || bucket.items.length === 0) {
    return (
      <div className="cart-empty">
        <p>Your cart is empty.</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  // ---- place order ----
  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert('Please fill your name, phone and address.');
      return;
    }
    try {
      setPlacing(true);

      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      const idToken = (auth.currentUser && await auth.currentUser.getIdToken()) || ctxToken;

      const payload = {
        shopId,
        customer: {
          name: form.name,
          phone: form.phone,
          address: { line: form.address, lat: form.lat, lng: form.lng }
        },
        items: bucket.items.map(i => ({ itemId: i.itemId, quantity: i.quantity })),
        notes: form.notes,
        paymentMethod: 'cod', // items paid to shop via UPI; driver gets delivery fee on delivery
        vehicleType,
      };

      const res = await axios.post(`${apiBase}/api/orders`, payload, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      clearShopCart(shopId);
      navigate(`/order-confirmation/${res.data.data._id}`);
    } catch (e) {
      console.error('[Cart] placeOrder error:', e?.response?.status, e?.response?.data || e.message);
      alert(e.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
     <Header />
    <div className="cart-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="cart-topbar">
        <h2>Cart · {bucket.shop?.shopName}</h2>
      </div>

      <div className="cart-items">
        {bucket.items.map(it => (
          <div className="cart-row" key={it.itemId}>
            <img src={it.imageUrl || '/placeholder-food.jpg'} alt={it.name} />
            <div className="name">{it.name}</div>
            <div className="price">₹{it.price}</div>
            {bucket.shop?.category === 'hotel' && it.veg != null && (
              <div className={`veg-tag ${it.veg ? 'veg' : 'nonveg'}`}>
                {it.veg ? 'Veg' : 'Non-Veg'}
              </div>
            )}
            <div className="qty">
              <button onClick={() => setQty(shopId, it.itemId, Math.max(1, it.quantity - 1))}>−</button>
              <span>{it.quantity}</span>
              <button onClick={() => setQty(shopId, it.itemId, it.quantity + 1)}>+</button>
            </div>
            <button className="remove" onClick={() => removeItem(shopId, it.itemId)}><MdDelete /></button>
          </div>
        ))}
      </div>

      {/* === Summary === */}
      <div className="cart-summary">
        <div className="row"><span>Subtotal</span><span>₹{pricing.subtotal.toFixed(2)}</span></div>
        {Number(pricing.tax) > 0 && (
          <div className="row"><span>Tax</span><span>₹{Number(pricing.tax).toFixed(2)}</span></div>
        )}
        <div className="row"><span>Delivery (to shop)</span><span>₹{pricing.deliveryFee.toFixed(2)}</span></div>
        <div className="row total"><span>Total (shop items)</span><span>₹{pricing.total.toFixed(2)}</span></div>
      </div>

      {/* ======= PAY FOR ITEMS (UPI via collected upiId) ======= */}
      <div className="checkout" style={{ marginTop: 16 }}>
        <h3>Pay for Items</h3>

        <div className="field" style={{ marginBottom: 8 }}>
          <small style={{ opacity: 0.8 }}>
            You’ll pay the <b>shop owner</b> for the items. Delivery fee is paid to the driver on delivery.
          </small>
        </div>

        {!upiUi.ready ? (
          <div className="field">
            <small style={{ color: '#b91c1c' }}>
              {upiUi.reason === 'MISSING_VPA'
                ? 'Payment unavailable — this shop has not set a UPI ID yet.'
                : 'Payment unavailable — total is ₹0.'}
            </small>
          </div>
        ) : (
          <>
            <div className="field" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {isAndroid() ? (
                <>
                  <a
                    href={upiUi.phonePeIntent}
                    className="btn-primary"
                    rel="noopener noreferrer"
                  >
                    Pay in PhonePe (₹{upiUi.amount.toFixed(2)})
                  </a>

                  <a
                    href={upiUi.upiChooserIntent}
                    className="btn-outline"
                    rel="noopener noreferrer"
                  >
                    Pay in any UPI app
                  </a>
                </>
              ) : (
                <>
                  {/* iOS/desktop: generic UPI link (works if a UPI app registered upi://) */}
                  <a
                    href={upiUi.upiUrl}
                    className="btn-primary"
                    rel="noopener noreferrer"
                  >
                    Open UPI app (₹{upiUi.amount.toFixed(2)})
                  </a>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          `VPA: ${upiUi.vpa}\nAmount: ₹${upiUi.amount.toFixed(2)}\nNote: Order at ${upiUi.shopName}`
                        );
                        alert('UPI details copied. Open your UPI app and paste.');
                      } catch {
                        alert(`VPA: ${upiUi.vpa}\nAmount: ₹${upiUi.amount.toFixed(2)}\nNote: Order at ${upiUi.shopName}`);
                      }
                    }}
                  >
                    Copy UPI details
                  </button>
                </>
              )}
            </div>

            {!isMobile() && (
              <div className="field" style={{ marginTop: 6 }}>
                <small style={{ opacity: 0.8 }}>
                  Tip: open this page on your phone to pay via UPI. Desktop browsers can’t handle UPI links.
                </small>
              </div>
            )}

            {upiUi.vpa && (
              <div className="field" style={{ marginTop: 6 }}>
                <small style={{ opacity: 0.8 }}>
                  Payee: <b>{upiUi.shopName}</b> · UPI: <code>{upiUi.vpa}</code>
                </small>
              </div>
            )}
          </>
        )}
      </div>

      {/* ======= ORDER (delivery) ======= */}
      <div className="checkout">
        <h3>Order Now</h3>

        <div className="field">
          <label>Name</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your full name"
          />
        </div>

        <div className="field">
          <label>Phone</label>
          <input
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="10-digit mobile number"
          />
        </div>

        <div className="delivery-estimator">
          <h3>Delivery</h3>

          <div className="field">
            <label>Drop-off Address</label>
            <AddressAutocomplete initialValue={form.address} onSelect={onAddressSelect} />
          </div>

          {/* Vehicle cards */}
          <div className="vehicle-options-containers">
            {vehicleCards.map((v) => {
              const isSelected = vehicleType === v.type;
              const isUnavailable = v.available === false;
              const classes = [
                'vehicle-options cart-vehicle-option',
                isSelected ? 'selected' : '',
                isUnavailable ? 'unavailable' : ''
              ].join(' ').trim();

              return (
                <button
                  type="button"
                  key={v.type}
                  className={classes}
                  onClick={() => {
                    if (!isUnavailable) {
                      setVehicleType(v.type);
                      if (distanceKm > 0) setEstimatedDelivery(+(distanceKm * v.rate).toFixed(2));
                    }
                  }}
                  aria-pressed={isSelected}
                >
                  {v.comingSoon && <div className="coming-soon cart-coming-soon">Coming&nbsp;Soon</div>}
                  <div className="vehicle-icons cart-vehicle-icons">{v.emoji}</div>

                  <div className="vehicle-info cart-vehicle-info">
                    <div className="vehicle-name cart-vehicle-name">{v.name}</div>
                    <div className="vehicle-capacity cart-vehicle-capacity">{v.capacity}</div>
                  </div>

                  <div className="vehicle-meta cart-vehicle-meta">
                    <div className="vehicle-rate cart-vehicle-rate">{v.displayRate}</div>
                    {distanceKm > 0 && (
                      <div className="vehicle-price cart-vehicle-price">₹{v.price?.toFixed(2)}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="est-lines">
            <div>Distance: <b>{distanceKm ? distanceKm.toFixed(2) : '—'} km</b></div>
            <div>
              Estimated delivery charge:{' '}
              <b>₹{estimatedDelivery ? estimatedDelivery.toFixed(2) : '—'}</b>{' '}
              <small style={{ opacity: .7 }}>(paid to driver on delivery)</small>
            </div>
          </div>
        </div>

        <button disabled={placing} onClick={placeOrder}>
          {placing ? 'Placing...' : 'Confirm Order'}
        </button>
      </div>
    </div>
            <Footer />
          </>
  );
}
