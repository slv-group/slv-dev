-- Create CSR activities table
CREATE TABLE IF NOT EXISTS public.csr_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    year INTEGER,
    date TEXT,
    location TEXT,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    impact TEXT,
    beneficiaries TEXT,
    featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.csr_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.csr_activities FOR SELECT USING (is_published = true);
CREATE POLICY "Allow admin full access" ON public.csr_activities FOR ALL USING (auth.role() = 'authenticated');

-- Create function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.csr_activities
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data from the docx
INSERT INTO public.csr_activities (title, category, year, date, location, short_description, description, image_url, impact, beneficiaries, featured, sort_order) VALUES
(
    '₹1 Crore Donation to Anna Canteens',
    'Food & Relief',
    2024,
    'August 2024',
    'Andhra Pradesh',
    'Supporting the Anna Canteen initiative to help provide affordable meals to people in need.',
    'Contribution of ₹1 Crore every year towards Anna Canteen initiatives to support affordable food and community welfare.',
    '/assets/csr/anna-canteen-donation.png',
    '₹1 Crore Contribution',
    'People & Families in Need',
    true,
    1
),
(
    'P4 Programme – Abdul Kalam Nagar Development',
    'Community',
    2024,
    '',
    'Andhra Pradesh',
    'Adopted Abdul Kalam Nagar Colony for comprehensive infrastructure development.',
    'Under the P4 Programme, SLV Group has adopted Abdul Kalam Nagar Colony for comprehensive infrastructure development, including CC roads, drainage systems, and household water connections, with an approximate investment of ₹1 Crore.',
    '/assets/csr/community.jpg',
    '₹1 Crore Investment',
    'Local Communities',
    false,
    2
),
(
    'Hare Krishna Movement of India',
    'Community',
    2024,
    '',
    'Kolanukonda',
    'Contribution to the Hare Krishna Movement towards temple development and community welfare.',
    'Contribution of ₹1 Crore to the Hare Krishna Movement of India, Kolanukonda, towards temple development & social and community welfare activities.',
    '/assets/csr/community.jpg',
    '₹1 Crore Contribution',
    'Society & Communities',
    false,
    3
),
(
    'Nutritious Meals for Site Workers',
    'Food & Relief',
    2024,
    '',
    'All SLV Group working sites',
    'Providing nutritious meals to site workers four days a week.',
    'Nutritious meals are provided four days a week during afternoon hours at all SLV Group working sites through the Akshaya Patra Foundation, supporting the well-being of workers.',
    '/assets/csr/anna-canteen-donation.png',
    'Worker Welfare',
    'Site Workers',
    false,
    4
),
(
    'Vijayawada Police Commissionerate – CCTV Infrastructure',
    'Community',
    2024,
    '',
    'Vijayawada',
    'Contribution towards CCTV camera infrastructure for public safety.',
    'Contribution of approximately ₹25 Lakhs towards CCTV camera infrastructure for the Vijayawada Police Commissionerate, supporting public safety and security.',
    '/assets/csr/community.jpg',
    '₹25 Lakhs Contribution',
    'Public Safety',
    false,
    5
),
(
    'HEAL Foundation',
    'Healthcare & Accessibility',
    2024,
    '',
    'Andhra Pradesh',
    'Supporting empowerment and welfare of disadvantaged children.',
    'Association with the HEAL Foundation, supporting the empowerment and welfare of disadvantaged children, including orphans and visually and physically challenged individuals. SLV Group also supports beneficiaries through the donation of electric wheelchairs.',
    '/assets/csr/community.jpg',
    'Empowerment',
    'Disadvantaged Children',
    false,
    6
),
(
    'Temple & Spiritual Activities',
    'Community',
    2024,
    '',
    'Bhimavaram',
    'Contributions towards temple development and religious activities.',
    'Contributions and donations towards temple development and religious activities, including support for the Bhimavaram Temple.',
    '/assets/csr/community.jpg',
    'Temple Development',
    'Spiritual Welfare',
    false,
    7
);
