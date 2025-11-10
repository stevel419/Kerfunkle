class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.string :stripe_price_id
      t.string :product_number, null: false
      t.string :image_url
      t.boolean :active, default: true
      t.integer :position, default: 0
      t.string :category

      t.timestamps
    end
    
    add_index :products, :product_number, unique: true
    add_index :products, :category
    add_index :products, :active
  end
end
