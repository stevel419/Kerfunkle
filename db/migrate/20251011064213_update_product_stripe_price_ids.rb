class UpdateProductStripePriceIds < ActiveRecord::Migration[8.0]
  def up
    # Update LED Strip Lights
    Product.where(name: '100ft RGB LED Strip Lights - 2 Rolls of 50ft with Remote and App Control')
           .update(stripe_price_id: 'price_1RPz9PCflHEhVRvmHHFuFE6j')

    # Update Disco Ball
    Product.where(name: 'Disco Ball - Sound Activated Party Lights with Remote Control')
           .update(stripe_price_id: 'price_1RPzIbCflHEhVRvmOEp67eH5')

    # Update Fog Machine
    Product.where(name: 'Fog Machine - 72 LED Lights, 500W and 2000 CFM Spray, Remote Control')
           .update(stripe_price_id: 'price_1RPzOmCflHEhVRvmCHPgceSa')

    # Update Fog Liquid
    Product.where(name: 'Fog Machine Liquid - 32oz High Density & Long-Lasting Fog Juice')
           .update(stripe_price_id: 'price_1RPzSpCflHEhVRvmv0c6luZx')
  end

  def down
    # Revert to placeholder values
    Product.where(name: '100ft RGB LED Strip Lights - 2 Rolls of 50ft with Remote and App Control')
           .update(stripe_price_id: 'price_led_strip_lights')

    Product.where(name: 'Disco Ball - Sound Activated Party Lights with Remote Control')
           .update(stripe_price_id: 'price_disco_ball')

    Product.where(name: 'Fog Machine - 72 LED Lights, 500W and 2000 CFM Spray, Remote Control')
           .update(stripe_price_id: 'price_fog_machine')

    Product.where(name: 'Fog Machine Liquid - 32oz High Density & Long-Lasting Fog Juice')
           .update(stripe_price_id: 'price_fog_liquid')
  end
end
