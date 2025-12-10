-- Create event_reports table
CREATE TABLE public.event_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  venue TEXT NOT NULL,
  season TEXT NOT NULL,
  image_url TEXT,
  type TEXT NOT NULL DEFAULT 'Festival',
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'base64url'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_reports ENABLE ROW LEVEL SECURITY;

-- Public can view reports via share token (no auth required)
CREATE POLICY "Anyone can view reports via share token"
ON public.event_reports
FOR SELECT
USING (true);

-- Admins can insert reports
CREATE POLICY "Admins can insert reports"
ON public.event_reports
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update reports
CREATE POLICY "Admins can update reports"
ON public.event_reports
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete reports
CREATE POLICY "Admins can delete reports"
ON public.event_reports
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_event_reports_updated_at
BEFORE UPDATE ON public.event_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.event_reports (title, event_date, venue, season, image_url, type, share_token) VALUES
('Business School Festival - Nairobi', '2025-10-22', 'Hyatt Regency Nairobi Westlands', 'Fall - 2025', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop', 'Festival', 'bsf-nairobi-2025'),
('Business School Festival - Lagos', '2025-11-15', 'Eko Hotels & Suites', 'Fall - 2025', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=400&fit=crop', 'Festival', 'bsf-lagos-2025'),
('MBA Meetup - Mumbai', '2025-09-10', 'The Taj Mahal Palace', 'Fall - 2025', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop', 'Meetup', 'meetup-mumbai-2025'),
('Virtual MBA Fair - Asia Pacific', '2025-08-05', 'Online Event', 'Summer - 2025', 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop', 'Virtual', 'virtual-asia-2025');