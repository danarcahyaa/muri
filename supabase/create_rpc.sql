-- SQL Script to create get_waste_purchases_rpc
-- Copy and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/clrreghxiyngkjvyxtxc/sql

-- Drop the function first to allow changing the return type structure
DROP FUNCTION IF EXISTS get_waste_purchases_rpc(
  UUID,
  TEXT,
  TEXT[],
  TIMESTAMP WITH TIME ZONE,
  TIMESTAMP WITH TIME ZONE
);

CREATE OR REPLACE FUNCTION get_waste_purchases_rpc(
  p_provider_id UUID,
  p_search_query TEXT DEFAULT NULL,
  p_status_filter TEXT[] DEFAULT NULL,
  p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  result_row JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(wp.*) || 
    jsonb_build_object(
      'brands', jsonb_build_object('id', b.id, 'brand_name', b.brand_name),
      'waste_posts', jsonb_build_object('id', post.id, 'provider_id', post.provider_id, 'custom_fabric_name', post.custom_fabric_name)
    ) AS result_row
  FROM waste_purchases wp
  INNER JOIN brands b ON wp.brand_id = b.id
  INNER JOIN waste_posts post ON wp.waste_post_id = post.id
  WHERE post.provider_id = p_provider_id
    AND (
      p_status_filter IS NULL 
      OR wp.purchase_status::TEXT = ANY(p_status_filter)
    )
    AND (
      p_date_from IS NULL 
      OR wp.created_at >= p_date_from
    )
    AND (
      p_date_to IS NULL 
      OR wp.created_at <= p_date_to
    )
    AND (
      p_search_query IS NULL 
      OR p_search_query = ''
      OR wp.fabric_name_snapshot ILIKE '%' || p_search_query || '%'
      OR b.brand_name ILIKE '%' || p_search_query || '%'
    );
END;
$$;
