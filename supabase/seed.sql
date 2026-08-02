-- 1. Buat data Waste Posts (Postingan Limbah Kain) untuk Provider jika belum ada
-- Menggunakan ID provider 'fe2adb0e-2611-4c74-9d37-b33907fa04d7' dan ID post '8282f00f-f2b7-43d3-bc97-57394f959c74'.
INSERT INTO waste_posts (id, provider_id, fabric_category_id, custom_fabric_name, details_and_conditions, status, weight_kg, price_per_kg, minimum_order_kg)
VALUES 
  (
    '8282f00f-f2b7-43d3-bc97-57394f959c74', 
    'fe2adb0e-2611-4c74-9d37-b33907fa04d7', 
    1, 
    'Perca Katun Premium', 
    'Sisa potongan kain katun motif floral bersih dan berkualitas tinggi', 
    'active', 
    50, 
    15000, 
    5
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Buat data Waste Purchases (Daftar Transaksi Pesanan) dengan Status Bervariasi
-- Menggunakan Brand ID pembeli 'de3b8543-ecac-40ff-8c20-a1cb6b58293c' and Waste Post ID '8282f00f-f2b7-43d3-bc97-57394f959c74'.
INSERT INTO waste_purchases (id, brand_id, waste_post_id, category_name_snapshot, fabric_name_snapshot, original_price_per_kg, final_price_idr, weight_bought_kg, purchase_status, media_urls_snapshot, created_at, updated_at)
VALUES 
  (
    '1ca93c7b-48ac-4e31-acd6-905232136602', 
    'de3b8543-ecac-40ff-8c20-a1cb6b58293c', 
    '8282f00f-f2b7-43d3-bc97-57394f959c74', 
    'Katun', 
    'Perca Katun Premium', 
    15000, 
    150000, 
    10, 
    'pending', 
    '["https://images.unsplash.com/photo-1524295981966-c447f5d635a5?auto=format&fit=crop&w=400&q=80", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"]'::jsonb, 
    now() - interval '2 days', 
    now() - interval '2 days'
  ),
  (
    'a2222222-2222-2222-2222-222222222222', 
    'de3b8543-ecac-40ff-8c20-a1cb6b58293c', 
    '8282f00f-f2b7-43d3-bc97-57394f959c74', 
    'Katun', 
    'Perca Katun Premium', 
    15000, 
    300000, 
    20, 
    'complete', 
    '["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80"]'::jsonb, 
    now() - interval '5 days', 
    now() - interval '4 days'
  ),
  (
    'a3333333-3333-3333-3333-333333333333', 
    'de3b8543-ecac-40ff-8c20-a1cb6b58293c', 
    '8282f00f-f2b7-43d3-bc97-57394f959c74', 
    'Katun', 
    'Perca Katun Premium', 
    15000, 
    75000, 
    5, 
    'cancelled', 
    '["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"]'::jsonb, 
    now() - interval '10 days', 
    now() - interval '9 days'
  ),
  (
    'a4444444-4444-4444-4444-444444444444', 
    'de3b8543-ecac-40ff-8c20-a1cb6b58293c', 
    '8282f00f-f2b7-43d3-bc97-57394f959c74', 
    'Katun', 
    'Perca Katun Premium', 
    15000, 
    75000, 
    5, 
    'rejected', 
    '["https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=400&q=80"]'::jsonb, 
    now() - interval '12 days', 
    now() - interval '12 days'
  ),
  (
    'a5555555-5555-5555-5555-555555555555', 
    'de3b8543-ecac-40ff-8c20-a1cb6b58293c', 
    '8282f00f-f2b7-43d3-bc97-57394f959c74', 
    'Katun', 
    'Perca Katun Premium', 
    15000, 
    150000, 
    10, 
    'pending', 
    '["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"]'::jsonb, 
    now() - interval '1 hour', 
    now() - interval '1 hour'
  )
ON CONFLICT (id) DO NOTHING;
