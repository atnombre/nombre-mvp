-- Seed Data: Sample Creators for Testing
-- Run this after the initial schema migration

-- Insert sample creators (famous YouTubers for demo)
INSERT INTO creators (youtube_channel_id, username, display_name, avatar_url, subscriber_count, view_count_30d, view_count_lifetime, video_count, cpi_score, token_symbol) VALUES
    ('UC-lHJZR3Gqxm24_Vd_AJ5Yw', '@pewdiepie', 'PewDiePie', 'https://yt3.googleusercontent.com/5oUY3tashyxfqsjO5SGhjT4dus8FkN9CsAHwXWISFrdPYii1FudD4ICtLfuCw6-THJsJbgoY=s176-c-k-c0x00ffffff-no-rj', 111000000, 150000000, 29000000000, 4500, 850.00, 'PEWDS'),
    
    ('UCX6OQ3DkcsbYNE6H8uQQuVA', '@mrbeast', 'MrBeast', 'https://yt3.googleusercontent.com/ytc/AIdro_kIBDjHvOJOoHpDGBILGvMwpxnNY0cNzQxe8qVIq-k53w=s176-c-k-c0x00ffffff-no-rj', 250000000, 500000000, 45000000000, 800, 950.00, 'BEAST'),
    
    ('UCq-Fj5jknLsUf-MWSy4_brA', '@tseries', 'T-Series', 'https://yt3.googleusercontent.com/ytc/AIdro_l2r6tRCjM7C3_Rx7qPbMJ-xfYQH_NrXHU0VfXH8g=s176-c-k-c0x00ffffff-no-rj', 260000000, 800000000, 230000000000, 20000, 920.00, 'TSERIES'),
    
    ('UCWX3G-k-UoHqnE8RL8DjXlQ', '@markiplier', 'Markiplier', 'https://yt3.googleusercontent.com/ytc/AIdro_lB1lq2StCbh-teSHLiQxo6LPf5w4WH_v-GDKDiJQ=s176-c-k-c0x00ffffff-no-rj', 36000000, 80000000, 20000000000, 5500, 650.00, 'MARK'),
    
    ('UC29ju8bIPH5as8OGnQzwJyA', '@theweeknd', 'The Weeknd', 'https://yt3.googleusercontent.com/WmQJafvgU6Xh7fBTQ2M9M_jBqwd9VYR6v9gfPk7Jn6qjdfwDz5PAOfEk7K8dJCQH-RvqPCs4lA=s176-c-k-c0x00ffffff-no-rj', 35000000, 200000000, 30000000000, 200, 720.00, 'WEEKND'),
    
    ('UCVHFbqXqoYvEWM1Ddxl0QDg', '@asmr', 'ASMR Zeitgeist', 'https://yt3.googleusercontent.com/ytc/AIdro_nE3LI5J8b7VF8WXu5K5F9T9g0K8T2b3d-iQxe5iw=s176-c-k-c0x00ffffff-no-rj', 4500000, 15000000, 2000000000, 600, 280.00, 'ASMR'),
    
    ('UCYzPXprvl5Y-Sf0g4vX-m6g', '@jacksepticeye', 'jacksepticeye', 'https://yt3.googleusercontent.com/nyvMD7E5RCFQM83FfH_DJIFLjqxG6R-YKO3fKzF7yWwrRhKdZ7K8SfBqr-L8eVVmKAWkE8hU=s176-c-k-c0x00ffffff-no-rj', 31000000, 40000000, 16000000000, 5000, 580.00, 'JACK'),
    
    ('UCam8T03EOFBsNdR0thrFHdQ', '@veritasium', 'Veritasium', 'https://yt3.googleusercontent.com/ytc/AIdro_n_CsIj4w_1c_W9aKPjFOoiXqBpmMJ_bGz_mC5Hxw=s176-c-k-c0x00ffffff-no-rj', 15000000, 50000000, 3000000000, 400, 420.00, 'VERIT')

ON CONFLICT (youtube_channel_id) DO NOTHING;

-- Create pools for each creator
INSERT INTO pools (creator_id, nmbr_reserve, initial_price, current_price, market_cap)
SELECT 
    c.id,
    c.cpi_score * 100 as nmbr_reserve,  -- Market cap based on CPI
    (c.cpi_score * 100) / 9000000 as initial_price,  -- Price = reserve / supply
    (c.cpi_score * 100) / 9000000 as current_price,
    c.cpi_score * 100 as market_cap
FROM creators c
WHERE NOT EXISTS (
    SELECT 1 FROM pools p WHERE p.creator_id = c.id
);

-- Add some initial price history for charts
INSERT INTO price_history (pool_id, price, volume, timestamp)
SELECT 
    p.id,
    p.current_price * (0.95 + random() * 0.1),  -- Random variation
    random() * 1000,
    NOW() - (interval '1 hour' * generate_series)
FROM pools p
CROSS JOIN generate_series(1, 24) -- 24 hours of data
ON CONFLICT DO NOTHING;
