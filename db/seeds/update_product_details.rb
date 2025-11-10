# Update products with detailed information from Dropshipping-Project
puts "🔄 Updating product details..."

# Product 1: LED Strip Lights
product1 = Product.find_by(product_number: "PROD001")
if product1
  product1.update!(
    rating: "4.4/5 (160,000+)",
    thumbnail_images: [
      "https://m.media-amazon.com/images/I/71hrEz6LYvL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/81gzj9hysBL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/81sfo4SF+IL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71raLhu5DUL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/81FVlmTevEL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/814B4+ShCYL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/715uHIW34VL._AC_SX679_.jpg"
    ].to_json,
    details: %{
      <ul>
        <li><strong>Music Sync:</strong> LED light strip changes color with the rhythm of sound and music for a romantic, relaxed atmosphere.</li>
        <li><strong>Easy Use:</strong> Control the LED strip lights via remote control or app for selecting colors, changing modes, and adjusting brightness.</li>
        <li><strong>Easy Installation:</strong> Stick the LED strips on a clean, dry surface and start enjoying the lighting.</li>
        <li><strong>Wide Use:</strong> Ultra long LED lights for bedroom 100ft (2 rolls of 50ft strip lights) suitable for decorating rooms, ceilings, desks, and parties.</li>
      </ul>
    },
    technical_details: %{
      <ul>
        <li><strong>Color:</strong> Multicolor</li>
        <li><strong>Indoor/Outdoor Usage:</strong> Indoor</li>
        <li><strong>Special Feature:</strong> Color Changing, Adjustable, Dimmable, Timer</li>
        <li><strong>Light Source Type:</strong> LED</li>
        <li><strong>Power Source:</strong> Corded Electric</li>
        <li><strong>Occasion:</strong> Christmas, Halloween, Party, Birthday, New Year</li>
        <li><strong>Style:</strong> Modern</li>
        <li><strong>Material:</strong> Plastic</li>
        <li><strong>Controller Type:</strong> App control, Remote control</li>
        <li><strong>Number of Light Sources:</strong> 480</li>
        <li><strong>Voltage:</strong> 24 Volts</li>
        <li><strong>Wattage:</strong> 36 watts</li>
        <li><strong>Item Weight:</strong> 25 Grams</li>
        <li><strong>Number of Items:</strong> 1</li>
        <li><strong>Item dimensions (L x W x H):</strong> 6 x 6 x 2.3 inches</li>
        <li><strong>Batteries Included?:</strong> No</li>
        <li><strong>Batteries Required?:</strong> No</li>
      </ul>
    }
  )
  puts "✅ Updated: #{product1.name}"
end

# Product 2: Disco Ball
product2 = Product.find_by(product_number: "PROD002")
if product2
  product2.update!(
    rating: "4.6/5 (42,000+)",
    thumbnail_images: [
      "https://m.media-amazon.com/images/I/71G4t-Vi4cL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71LCvCtxb-L._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/61QYuNNjKFL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71RZJw0RwbL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71sDlT6GhzL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71zQl9KOxaL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71hLmuRnE8L._AC_SX679_.jpg"
    ].to_json,
    details: %{
      <ul>
        <li><strong>Multi-functional sound activated party lights:</strong> 3 sound-activated modes + 7 lighting modes + Rotating speed control.</li>
        <li><strong>Bright 7 modes changing disco lighting:</strong> The disco ball light is easy to choose single colors or multicolor combination by the handy remote. (red, green, blue, red/green, red/blue, green/blue, or all the colors together).</li>
        <li><strong>Perfect party decorations:</strong> Good choice as party accessories for birthday party, pool party, disco party, dance party, pajama party, and Holiday, Wedding, Christmas, Karaoke, DJ, Christmas party decorations, Halloween party supplies, New Years decorations and more imaginable uses.</li>
        <li><strong>Easy to Use:</strong> LED stage lights, plug in and play, you can put it on your desk, and it also could be installed on the wall or ceiling.</li>
      </ul>
    },
    technical_details: %{
      <ul>
        <li><strong>Color:</strong> Black</li>
        <li><strong>Shape:</strong> Round</li>
        <li><strong>Material:</strong> Acrylonitrile Butadiene Styrene (ABS)</li>
        <li><strong>Light Source Type:</strong> Light Emitting Diode</li>
        <li><strong>Power Source:</strong> Wired Electric</li>
        <li><strong>Number of Light Sources:</strong> 3</li>
        <li><strong>Number of Batteries:</strong> 1 Lithium Metal batteries required</li>
        <li><strong>Battery Description:</strong> Lithium-Ion or Lithium Metal</li>
        <li><strong>Voltage:</strong> 110 Volts</li>
        <li><strong>Maximum Compatible Light Source Wattage:</strong> 3 Watts</li>
        <li><strong>Bulb Features:</strong> Remote control, Sound activated</li>
        <li><strong>Item Weight:</strong> 0.2 Kilograms</li>
        <li><strong>Item Package Quantity:</strong> 1</li>
        <li><strong>Item dimensions (L x W x H):</strong> 3.43 x 3.43 x 3.82 inches</li>
        <li><strong>Included Components:</strong> 1 x disco ball light, 1 x remote control, 1 x user manual</li>
        <li><strong>Batteries Included?:</strong> No</li>
        <li><strong>Batteries Required?:</strong> No</li>
      </ul>
    }
  )
  puts "✅ Updated: #{product2.name}"
end

# Product 3: Fog Machine
product3 = Product.find_by(product_number: "PROD003")
if product3
  product3.update!(
    rating: "4.3/5 (100+)",
    thumbnail_images: [
      "https://m.media-amazon.com/images/I/71BVFzuKvzL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71nksJBk0OL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71QW7yd4w1L._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/715YXiY5xBL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71iYoTI2kmL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71ZoBqlb9PL._AC_SX679_.jpg"
    ].to_json,
    details: %{
      <ul>
        <li><strong>Upgraded Smoke Machine:</strong> Featuring 72 ultra-bright small-angle lamp beads, the smoke machine delivers a strong beam effect with each lamp bead corresponding to one light beam. By combining different colors, the smoke can create a magical rainbow effect.</li>
        <li><strong>Dynamic Lighting Effects - Stunning Strobe Lights:</strong> The smoke machine includes 12 fixed light colors and 3 auto programs, with the lamp beads arranged in 3 rings. In racing mode, it produces a stunning light effect that appears to approach and recede, resembling a time tunnel, while the smoke flows through, creating a breathtaking visual experience.</li>
        <li><strong>Ultra-Long Smoke Duration - Continuous Enjoyment:</strong> The smoke machine is equipped with a powerful smoke emission system, ensuring a thick smoke output even during large events, with an expected single smoke duration of over 45 seconds. Whether for performances or parties, the atmosphere remains consistently enchanting, providing endless enjoyment.</li>
        <li><strong>Simple Operation - Large Oil Tank & Wireless Remote Control:</strong> With an ultra-large oil tank capacity, you can say goodbye to frequent refills. In addition, it is equipped with a large wireless remote control, which can operate the smoke output and lighting separately or combined. The remote control has a wider effective range and can be perfectly adapted to various situations for effortless operation.</li>
        <li><strong>Durable Quality - Long-lasting Use:</strong> This smoke machine is crafted with high-quality materials, ensuring outstanding performance even under intense use. The dual temperature control circuit enhances safety and reliability, making this smoke machine a dependable companion for professional performances, family gatherings, and festive parties.</li>
        <li><strong>NOTE:</strong> This does not come with fog liquid or fog fluid.</li>
      </ul>
    },
    technical_details: %{
      <ul>
        <li><strong>Item Weight:</strong> 4.18 pounds</li>
        <li><strong>Product Dimensions (L x W x H):</strong> 10.04 x 5.31 x 4.92 inches</li>
        <li><strong>Battery type:</strong> Silver Oxide</li>
        <li><strong>CHOKING HAZARD:</strong> Small parts. Not for children under 3 yrs.</li>
      </ul>
    }
  )
  puts "✅ Updated: #{product3.name}"
end

# Product 4: Fog Machine Liquid
product4 = Product.find_by(product_number: "PROD004")
if product4
  product4.update!(
    rating: "4.5/5 (150+)",
    thumbnail_images: [
      "https://m.media-amazon.com/images/I/714pjo+YaML._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/81BC5GCw-lL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/81vapJ8JItL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/71qztnTxy8L._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/81tlf6z02-L._AC_SX679_.jpg"
    ].to_json,
    details: %{
      <ul>
        <li><strong>Frighteningly Affordable:</strong> Your ultimate choice for safe, spooky, and unforgettable fun. This generous 32 fl oz, ready-to-use formula can be poured directly into most water-based fog and smoke machines.</li>
        <li><strong>Hauntingly Epic:</strong> The specially formulated fog machine fluid creates the highest density and longest-lasting fog on the market. Awe your guests with thick and dense fog for hours at Halloween parties, concerts, haunted houses, weddings, theme parks, laser tag, events, and raves.</li>
        <li><strong>Spooky & Safe:</strong> The non-toxic, biodegradable, dyeless, odorless fog juice is free from harmful chemicals and substances, ensuring safety to kids, pets, clothing, plants, and surfaces.</li>
        <li><strong>No Mess, No Clean-Up:</strong> After hours of eerie fog, enjoy the convenience of no post-party clean up - the self-dissipating solution will take care of itself without a trace.</li>
        <li><strong>Universal:</strong> The formula is compatible with most 400-3000 watt machines. Consider chilling the fog liquid for optimal results.</li>
      </ul>
    },
    technical_details: %{
      <ul>
        <li><strong>Item Weight:</strong> 2.4 pounds</li>
        <li><strong>Package Dimensions:</strong> 7.68 x 5.12 x 2.24 inches</li>
      </ul>
    }
  )
  puts "✅ Updated: #{product4.name}"
end

puts "✨ Product details update complete!"

