FactoryBot.define do
  factory :order do
    user { nil }
    stripe_checkout_session_id { "MyString" }
    stripe_payment_intent_id { "MyString" }
    status { "MyString" }
    total_amount { "9.99" }
    customer_email { "MyString" }
    shipping_address { "" }
    billing_address { "" }
    paid_at { "2025-10-10 09:49:53" }
    shipped_at { "2025-10-10 09:49:53" }
  end
end
