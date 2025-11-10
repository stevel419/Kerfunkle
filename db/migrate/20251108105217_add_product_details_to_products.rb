class AddProductDetailsToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :rating, :string
    add_column :products, :thumbnail_images, :text
    add_column :products, :details, :text
    add_column :products, :technical_details, :text
  end
end
