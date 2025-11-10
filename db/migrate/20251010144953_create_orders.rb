class CreateOrders < ActiveRecord::Migration[8.0]
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.string :stripe_checkout_session_id
      t.string :stripe_payment_intent_id
      t.string :status, default: 'pending'
      t.decimal :total_amount, precision: 10, scale: 2
      t.string :customer_email
      t.jsonb :shipping_address, default: {}
      t.jsonb :billing_address, default: {}
      t.datetime :paid_at
      t.datetime :shipped_at

      t.timestamps
    end
    
    add_index :orders, :stripe_checkout_session_id, unique: true
    add_index :orders, :status
  end
end
