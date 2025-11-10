class FixCartsUserIdNullability < ActiveRecord::Migration[8.0]
  def up
    change_column_null :carts, :user_id, true
  end

  def down
    change_column_null :carts, :user_id, false
  end
end
