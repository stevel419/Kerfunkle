# Clear existing data
puts "Clearing existing data..."
OrderItem.destroy_all
Order.destroy_all
CartItem.destroy_all
Cart.destroy_all
Product.destroy_all
User.destroy_all

puts "Creating products..."

# Product 1: LED Strip Lights
Product.create!(
  name: "100ft RGB LED Strip Lights - 2 Rolls of 50ft with Remote and App Control",
  description: "Transform your space with these versatile LED strip lights. Features include RGB color changing, remote control, and app connectivity for easy customization. Perfect for parties, room decoration, and ambient lighting.",
  price: 12.99,
  product_number: "PROD001",
  stripe_price_id: "price_led_strip_lights", # Update with actual Stripe price ID
  image_url: "https://m.media-amazon.com/images/I/51i6YjrXxJL._MCnd_AC_.jpg",
  category: "LED Lights",
  position: 1,
  active: true
)

# Product 2: Disco Ball
Product.create!(
  name: "Disco Ball - Sound Activated Party Lights with Remote Control",
  description: "Create an instant party atmosphere with this sound-activated disco ball. Features multiple color modes, remote control operation, and automatic sound sync for dynamic lighting effects.",
  price: 15.99,
  product_number: "PROD002",
  stripe_price_id: "price_disco_ball", # Update with actual Stripe price ID
  image_url: "https://m.media-amazon.com/images/I/41A6iTSM3KL._MCnd_AC_.jpg",
  category: "Disco Balls",
  position: 2,
  active: true
)

# Product 3: Fog Machine
Product.create!(
  name: "Fog Machine - 72 LED Lights, 500W and 2000 CFM Spray, Remote Control",
  description: "Professional-grade fog machine with built-in LED lights. Features 500W power, 2000 CFM output, and wireless remote control. Perfect for parties, events, and theatrical productions.",
  price: 34.99,
  product_number: "PROD003",
  stripe_price_id: "price_fog_machine", # Update with actual Stripe price ID
  image_url: "https://m.media-amazon.com/images/I/51RI5DGFhuL._MCnd_AC_.jpg",
  category: "Fog Machines",
  position: 3,
  active: true
)

# Product 4: Fog Machine Liquid
Product.create!(
  name: "Fog Machine Liquid - 32oz High Density & Long-Lasting Fog Juice",
  description: "Premium quality fog juice designed for optimal performance. High density formula produces thick, long-lasting fog. Safe, non-toxic, and water-based. 32oz bottle provides extended use.",
  price: 19.99,
  product_number: "PROD004",
  stripe_price_id: "price_fog_liquid", # Update with actual Stripe price ID
  image_url: "https://m.media-amazon.com/images/I/714pjo+YaML._AC_AA360_.jpg",
  category: "Accessories",
  position: 4,
  active: true
)

puts "✅ Created #{Product.count} products"

# Create a test user (optional for development)
if Rails.env.development?
  puts "Creating test user..."
  test_user = User.create!(
    email: "test@kerfunkle.com"
  )
  puts "✅ Created test user: #{test_user.email}"
end

puts "🎉 Seed data created successfully!"
