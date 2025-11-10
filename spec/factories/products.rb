FactoryBot.define do
  factory :product do
    name { "MyString" }
    description { "MyText" }
    price { "9.99" }
    stripe_price_id { "MyString" }
    product_number { "MyString" }
    image_url { "MyString" }
    active { false }
    position { 1 }
    category { "MyString" }
  end
end
