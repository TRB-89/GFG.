-- GFG PLATFORM MODULE 2: PRODUCTION POSTGRESQL / SUPABASE SEED SCRIPT
-- Insert Initial Core Skills
INSERT INTO skills (id, name, category) VALUES
(gen_random_uuid(), 'Python', 'Programming'),
(gen_random_uuid(), 'Java', 'Programming'),
(gen_random_uuid(), 'SQL', 'Database'),
(gen_random_uuid(), 'React', 'Frontend'),
(gen_random_uuid(), 'Power BI', 'Data Analytics'),
(gen_random_uuid(), 'Machine Learning', 'AI / Data'),
(gen_random_uuid(), 'UI/UX', 'Design'),
(gen_random_uuid(), 'AWS', 'Cloud'),
(gen_random_uuid(), 'Communication', 'Soft Skills'),
(gen_random_uuid(), 'Marketing', 'Marketing'),
(gen_random_uuid(), 'Spring Boot', 'Backend'),
(gen_random_uuid(), 'Tableau', 'Data Analytics'),
(gen_random_uuid(), 'Docker', 'DevOps'),
(gen_random_uuid(), 'Kubernetes', 'DevOps'),
(gen_random_uuid(), 'JavaScript', 'Frontend'),
(gen_random_uuid(), 'TypeScript', 'Frontend'),
(gen_random_uuid(), 'Product Management', 'Management'),
(gen_random_uuid(), 'Agile / Scrum', 'Management'),
(gen_random_uuid(), 'Data Visualization', 'Data Analytics'),
(gen_random_uuid(), 'Pandas', 'Data Analytics'),
(gen_random_uuid(), 'PostgreSQL', 'Database'),
(gen_random_uuid(), 'Git & GitHub', 'Tools'),
(gen_random_uuid(), 'Figma', 'Design'),
(gen_random_uuid(), 'Cybersecurity Fundamentals', 'Security'),
(gen_random_uuid(), 'Financial Analysis', 'Finance')
ON CONFLICT (name) DO NOTHING;

-- Insert Initial Core Interests
INSERT INTO interests (id, name, category) VALUES
(gen_random_uuid(), 'AI / ML', 'Technology'),
(gen_random_uuid(), 'Data Analytics', 'Analytics'),
(gen_random_uuid(), 'Cloud', 'Infrastructure'),
(gen_random_uuid(), 'Cybersecurity', 'Security'),
(gen_random_uuid(), 'Web Development', 'Engineering'),
(gen_random_uuid(), 'UI/UX', 'Design'),
(gen_random_uuid(), 'Business Analysis', 'Business'),
(gen_random_uuid(), 'HR', 'People'),
(gen_random_uuid(), 'Finance', 'Finance'),
(gen_random_uuid(), 'Marketing', 'Growth'),
(gen_random_uuid(), 'Project Management', 'Operations'),
(gen_random_uuid(), 'Teaching', 'Education'),
(gen_random_uuid(), 'FinTech', 'Domain'),
(gen_random_uuid(), 'Healthcare Tech', 'Domain'),
(gen_random_uuid(), 'EdTech', 'Domain')
ON CONFLICT (name) DO NOTHING;

-- Demo Profiles, Companies, Jobs, Candidates & Applications are ready in seed_data.py or via automated script.
