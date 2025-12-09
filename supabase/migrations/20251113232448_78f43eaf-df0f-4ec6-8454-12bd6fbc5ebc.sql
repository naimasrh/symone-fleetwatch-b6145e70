-- Create ai_recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('speed', 'break', 'route', 'client_notification')),
  message TEXT NOT NULL,
  impact TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
CREATE POLICY "Allow public read on ai_recommendations"
ON public.ai_recommendations
FOR SELECT
USING (true);

-- Create policy for public insert
CREATE POLICY "Allow public insert on ai_recommendations"
ON public.ai_recommendations
FOR INSERT
WITH CHECK (true);

-- Create policy for public update
CREATE POLICY "Allow public update on ai_recommendations"
ON public.ai_recommendations
FOR UPDATE
USING (true);

-- Create index for better performance
CREATE INDEX idx_ai_recommendations_mission_id ON public.ai_recommendations(mission_id);
CREATE INDEX idx_ai_recommendations_status ON public.ai_recommendations(status);
CREATE INDEX idx_ai_recommendations_priority ON public.ai_recommendations(priority);