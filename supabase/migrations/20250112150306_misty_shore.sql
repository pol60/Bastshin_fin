/*
  # Additional Admin Functionality

  1. Changes
    - Add admin delete policies
    - Add admin insert policies
    - Add analytics tracking functions
*/

-- Admin Delete Policies
CREATE POLICY "Admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "Admins can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Admin Insert Policies
CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Analytics Functions
CREATE OR REPLACE FUNCTION track_event(
  event_name text,
  event_data jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO analytics (event_type, event_data)
  VALUES (event_name, event_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin Dashboard Functions
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_orders', (SELECT COUNT(*) FROM orders),
    'total_users', (SELECT COUNT(*) FROM users),
    'total_revenue', (SELECT COALESCE(SUM(total), 0) FROM orders),
    'products_count', (SELECT COUNT(*) FROM products)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;