class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :verification_code
      t.datetime :code_expires_at
      t.integer :login_attempts, default: 0
      t.datetime :last_login_at

      t.timestamps
    end
    
    add_index :users, :email, unique: true
  end
end
