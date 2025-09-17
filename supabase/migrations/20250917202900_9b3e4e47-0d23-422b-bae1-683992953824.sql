-- Fix all remaining function security issues by adding proper search_path settings

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- 2. Fix update_raffle_sold_tickets function  
CREATE OR REPLACE FUNCTION public.update_raffle_sold_tickets()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public
AS $function$
BEGIN
    -- Atualiza o contador de bilhetes vendidos na rifa
    UPDATE raffles 
    SET sold_tickets = (
        SELECT COUNT(*) 
        FROM tickets 
        WHERE raffle_id = COALESCE(NEW.raffle_id, OLD.raffle_id) 
        AND status = 'sold'
    ),
    revenue = (
        SELECT COUNT(*) * ticket_price
        FROM tickets t
        JOIN raffles r ON r.id = t.raffle_id
        WHERE t.raffle_id = COALESCE(NEW.raffle_id, OLD.raffle_id) 
        AND t.status = 'sold'
    )
    WHERE id = COALESCE(NEW.raffle_id, OLD.raffle_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 3. Fix approve_testimonial function - Convert to SECURITY DEFINER for admin operations
CREATE OR REPLACE FUNCTION public.approve_testimonial(testimonial_id uuid, approver_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER  -- Needs elevated privileges to update testimonials
 SET search_path = public
AS $function$
BEGIN
    -- Verify approver is admin
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = approver_id 
        AND role = 'admin' 
        AND status = 'active'
    ) THEN
        RETURN false;
    END IF;
    
    UPDATE testimonials 
    SET status = 'approved',
        approved_by = approver_id,
        approved_at = NOW()
    WHERE id = testimonial_id;
    
    RETURN FOUND;
END;
$function$;

-- 4. Fix reject_testimonial function - Convert to SECURITY DEFINER for admin operations  
CREATE OR REPLACE FUNCTION public.reject_testimonial(testimonial_id uuid, approver_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER  -- Needs elevated privileges to update testimonials
 SET search_path = public
AS $function$
BEGIN
    -- Verify approver is admin
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = approver_id 
        AND role = 'admin' 
        AND status = 'active'
    ) THEN
        RETURN false;
    END IF;
    
    UPDATE testimonials 
    SET status = 'rejected',
        approved_by = approver_id,
        approved_at = NOW()
    WHERE id = testimonial_id;
    
    RETURN FOUND;
END;
$function$;

-- 5. Fix auto_moderate_testimonial function
CREATE OR REPLACE FUNCTION public.auto_moderate_testimonial()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.rating >= 4 AND LENGTH(NEW.content) <= 200 THEN
    NEW.status := 'approved';
  ELSE
    NEW.status := 'pending';
  END IF;
  
  NEW.created_at := NOW();
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$function$;