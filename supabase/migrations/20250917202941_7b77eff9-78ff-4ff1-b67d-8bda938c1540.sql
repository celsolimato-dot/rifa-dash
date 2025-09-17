-- Convert testimonial functions back to SECURITY INVOKER and rely on RLS policies instead

-- 1. Convert approve_testimonial back to SECURITY INVOKER 
CREATE OR REPLACE FUNCTION public.approve_testimonial(testimonial_id uuid, approver_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY INVOKER  -- Changed back to SECURITY INVOKER
 SET search_path = public
AS $function$
BEGIN
    -- The RLS policies on testimonials table will handle admin access control
    UPDATE testimonials 
    SET status = 'approved',
        approved_by = approver_id,
        approved_at = NOW()
    WHERE id = testimonial_id;
    
    RETURN FOUND;
END;
$function$;

-- 2. Convert reject_testimonial back to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.reject_testimonial(testimonial_id uuid, approver_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY INVOKER  -- Changed back to SECURITY INVOKER  
 SET search_path = public
AS $function$
BEGIN
    -- The RLS policies on testimonials table will handle admin access control
    UPDATE testimonials 
    SET status = 'rejected',
        approved_by = approver_id,
        approved_at = NOW()
    WHERE id = testimonial_id;
    
    RETURN FOUND;
END;
$function$;

-- 3. Update get_testimonial_stats function to ensure it has proper search_path
CREATE OR REPLACE FUNCTION public.get_testimonial_stats(raffle_id_param uuid)
 RETURNS TABLE(total_testimonials bigint, average_rating numeric, rating_distribution jsonb)
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public  -- Ensure search_path is set
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_testimonials,
    ROUND(AVG(rating), 2) as average_rating,
    JSONB_BUILD_OBJECT(
      '5_stars', COUNT(*) FILTER (WHERE rating = 5),
      '4_stars', COUNT(*) FILTER (WHERE rating = 4),
      '3_stars', COUNT(*) FILTER (WHERE rating = 3),
      '2_stars', COUNT(*) FILTER (WHERE rating = 2),
      '1_star', COUNT(*) FILTER (WHERE rating = 1)
    ) as rating_distribution
  FROM testimonials 
  WHERE raffle_id = raffle_id_param 
  AND status = 'approved';
END;
$function$;