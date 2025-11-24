// src/components/helpData.js
export const helpTopics = [
  {
    id: 1,
    main: "help_topic_book_vehicle",
    related: [
      { q: "help_q_pick_drop", a: "help_a_pick_drop" },
      { q: "help_q_choose_vehicle", a: "help_a_choose_vehicle" },
      { q: "help_q_confirm_booking", a: "help_a_confirm_booking" },
      { q: "help_q_cancel_ride", a: "help_a_cancel_ride" },
      { q: "help_q_contact_driver", a: "help_a_contact_driver" }
    ],
  },
  {
    id: 2,
    main: "help_topic_shop_order",
    related: [
      { q: "help_q_find_shops", a: "help_a_find_shops" },
      { q: "help_q_add_items", a: "help_a_add_items" },
      { q: "help_q_shop_payment", a: "help_a_shop_payment" },
      { q: "help_q_who_delivers", a: "help_a_who_delivers" },
      { q: "help_q_track_order", a: "help_a_track_order" }
    ],
  },
  {
    id: 3,
    main: "help_topic_payment_process",
    related: [
      { q: "help_q_pay_driver", a: "help_a_pay_driver" },
      { q: "help_q_shop_upi", a: "help_a_shop_upi" },
      { q: "help_q_razorpay", a: "help_a_razorpay" },
      { q: "help_q_any_hidden_charge", a: "help_a_any_hidden_charge" }
    ],
  },
  {
    id: 4,
    main: "help_topic_parcel_delivery",
    related: [
      { q: "help_q_driver_collect_parcel", a: "help_a_driver_collect_parcel" },
      { q: "help_q_receiver_confirm", a: "help_a_receiver_confirm" },
      { q: "help_q_driver_delay", a: "help_a_driver_delay" },
      { q: "help_q_fragile_items", a: "help_a_fragile_items" }
    ],
  },
  {
    id: 5,
    main: "help_topic_delivery_charges",
    related: [
      { q: "help_q_cost_factors", a: "help_a_cost_factors" },
      { q: "help_q_waiting_charge", a: "help_a_waiting_charge" },
      { q: "help_q_estimate_fare", a: "help_a_estimate_fare" }
    ],
  },
  {
    id: 6,
    main: "help_topic_register_shop",
    related: [
      { q: "help_q_where_register", a: "help_a_where_register" },
      { q: "help_q_required_details", a: "help_a_required_details" },
      { q: "help_q_edit_shop", a: "help_a_edit_shop" }
    ],
  },
  {
    id: 7,
    main: "help_topic_delivery_delayed",
    related: [
      { q: "help_q_delay_reason", a: "help_a_delay_reason" },
      { q: "help_q_report_delay", a: "help_a_report_delay" },
      { q: "help_q_refund_policy", a: "help_a_refund_policy" }
    ],
  },
  {
    id: 8,
    main: "help_topic_support",
    related: [
      { q: "help_q_contact_support", a: "help_a_contact_support" },
      { q: "help_q_support_hours", a: "help_a_support_hours" }
    ],
  },
];
