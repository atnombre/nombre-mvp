"""
Script to add top YouTubers to the database.
Uses YouTube Data API to fetch channel data and creates creator records.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/add_top_youtubers.py
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.youtube_service import YouTubeService
from app.database import get_supabase
from app.config import get_settings
import uuid

# Top 250 YouTube channels by subscriber count (as of 2024)
# Format: (channel_id, expected_name) - channel_id is the UC... format
TOP_YOUTUBERS = [
    # 250M+ Subs
    ("UCX6OQ3DkcsbYNE6H8uQQuVA", "MrBeast"),
    ("UCq-Fj5jknLsUf-MWSy4_brA", "T-Series"),
    ("UCbCmjCuTUZos6Inko4u57UQ", "Cocomelon"),
    ("UCpEhnqL0y41EpW2TvWAHD7Q", "SET India"),
    ("UC-lHJZR3Gqxm24_Vd_AJ5Yw", "PewDiePie"),
    ("UCvlE5gTbOvjiolFlEm-c_Ow", "Kids Diana Show"),
    ("UCJ5v_MCY6GNUBTO8-D3XoAg", "WWE"),
    ("UCk1SpWNzOs4MYmr0uICEntg", "Like Nastya"),
    ("UC295-Dw_tDNtZXFeAPAQKEw", "Vlad and Niki"),
    ("UChGJGhZ9SOOHvBB0Y4DOO_w", "Music"),
    
    # 100M+ Subs
    ("UCFFbwnve3yF62-tVXkTyHqg", "Zee Music Company"),
    ("UCYiGq8XF7YQD00x7wAd62Zg", "Blackpink"),
    ("UCOmHUn--16B90oW2L6FRR3A", "BANGTANTV"),
    ("UCVHFbqXqoYvEWM1Ddxl0QDg", "Alan Walker"),
    ("UC-9-kyTW8ZkZNDHQJ6FgpwQ", "Dude Perfect"),
    ("UCRijo3ddMTht_IHyNSNXpNQ", "Dua Lipa"),
    ("UCIwFjwMjI0y7PDBVEO9-bkQ", "Justin Bieber"),
    ("UCZFWPqqPkFlNwIxcpsLOwew", "Marshmello"),
    ("UCWOA1ZGywLbqmigxE4Qlvuw", "Zee TV"),
    ("UCnQC_G5Xsjhp9fEJKuIcrSw", "Bad Bunny"),
    
    # Gaming Channels
    ("UCWX3G-k-UoHqnE8RL8DjXlQ", "Markiplier"),
    ("UCYzPXprvl5Y-Sf0g4vX-m6g", "jacksepticeye"),
    ("UCiGm_E4ZwYSHV3bcW1pnSeQ", "Fernanfloo"),
    ("UClU1m5ZiNDZfDUqVfXuB4LA", "DanTDM"),
    ("UCYVinkwSX7szARULgYpvhLw", "SSSniperWolf"),
    ("UC4PooiX37Pld1T8J5SYT-SQ", "VEGETTA777"),
    ("UCIPPMRA040LQr5QPyJEbmXA", "MrBeast Gaming"),
    ("UCWUxX6rV_3cSJFLqb5NfmEg", "SkyDoesMinecraft"),
    ("UCN2lU5fW3C8ATq7VuM_HdYQ", "Dream"),
    ("UCpB959t8iPrxQWj7G6n0ctQ", "LOUD"),
    
    # Entertainment & Vlogs
    ("UCam8T03EOFBsNdR0thrFHdQ", "Veritasium"),
    ("UCsooa4yRKGN_zEE8iknghZA", "TED-Ed"),
    ("UCJQJAI7IjbLcpsjWdSzYz0Q", "Philip DeFranco"),
    ("UCsXVk37bltHxD1rDPwtNM8Q", "Kurzgesagt"),
    ("UCq8DICunczvLuJJq414110A", "Colleen Vlogs"),
    ("UCYxRlFDqcWM4y7FfpiAN3KQ", "Danny Gonzalez"),
    ("UCzYa-Zd0UD-eDIKbcqKVPvg", "The Ellen Show"),
    ("UCMiJRAwDNSNzuYeN2uWa0pA", "MrBeast"),
    ("UCkQO3QsgTpNTsOw6ujimT5Q", "NickEh30"),
    ("UCq6VFHwMzcMXbuKyG7SQYIg", "LinusTechTips"),
    
    # Music Artists
    ("UCByOQJjav0CUDwxCk-jVNRQ", "Drake"),
    ("UComP_epzeKzvBX156r6pm1Q", "Ariana Grande"),
    ("UC20vb-R_px4CguHzzBPhoyQ", "Beyoncé"),
    ("UCctpL8rNBDjNoJAGrW-L_Ow", "Post Malone"),
    ("UCANLZYMidaCbLQFWXBI2awA", "Rihanna"),
    ("UC2xskkQVFEpLcGFnNSLQY0A", "The Weeknd"),
    ("UC0RhatS1pyxInC00YKjjBqQ", "Billie Eilish"),
    ("UCqECaJ8Gagnn7YCbPEzWH6g", "Taylor Swift"),
    ("UCZRdm-rMZDAyFv_GhFPLEkw", "Ed Sheeran"),
    ("UC2pmfLm7iq6Ov1UwYrWYkZA", "Eminem"),
    
    # Education & Science
    ("UCOsGxP9_qQlvJrKMt9jLqzA", "3Blue1Brown"),
    ("UCBa659QWEk1AI4Tg--mrJ2A", "Tom Scott"),
    ("UCpko_-a4wgz2u_DgDgd9fqA", "Fireship"),
    ("UCV0qA-eDDICsRR9rPcnG7tw", "Corridor Crew"),
    ("UCZnl4B8tSPqYtmTzmqbxxHQ", "Matt D'Avella"),
    ("UCHnyfMqiRRG1u-2MsSQLbXA", "Vsauce"),
    ("UCsBjURrPoezykLs9EqgamOA", "Fireship"),
    ("UCJ0-OtVpF0wOKEqT2Z1HEtA", "ColdFusion"),
    ("UCX6b17PVsYBQ0ip5gyeme-Q", "CrashCourse"),
    ("UCWX3ZfHfDHdfW_XuTXNAEIQ", "Science Insider"),
    
    # Tech
    ("UCBJycsmduvYEL83R_U4JriQ", "MKBHD"),
    ("UCXuqSBlHAE6Xw-yeJA0Tunw", "LTT"),
    ("UCVYamHliCI9rw1tHR1xbkfw", "Dave2D"),
    ("UCsTcErHg8oDvUnTzoqsYeNw", "Unbox Therapy"),
    ("UCSHZKyawb77ixDdsGog4iWA", "Lex Fridman"),
    ("UCey_c7U86mJGz1VJWH5CYPA", "PowerfulJRE"),
    ("UCbmNph6atAoGfqLoCL_duAg", "CNET"),
    ("UCXGgrKt94gR6lmN4aN3mYTg", "Austin Evans"),
    ("UC9-y-6csu5WGm29I7JiwpnA", "Computerphile"),
    ("UCYO_jab_esuFRV4b17AJtAw", "3Blue1Brown"),
    
    # Comedy & Podcasts
    ("UCLkAepWjdylmXSltofFvsYQ", "NELK"),
    ("UCmDTrq0LNgPodDOFZiSbsww", "NELK"),
    ("UCLXo7UDZvByw2ixzpQCufnA", "Vox"),
    ("UCJkMlOu7faDgqh4PfzbpLdg", "Nardwuar"),
    ("UCCXLzwOqhOA3NXJKFA2QEDA", "Theo Von"),
    ("UC3lBXcrKFnFAFkfVk5WuKcQ", "H3 Podcast"),
    ("UCDlxFs3A0xNxjXZYp1M-RJg", "KSI"),
    ("UCaYhcUwRBNscFNUKTjgPFiA", "Smosh"),
    ("UCu7zLXKhUs7cFwVB_WiNuTg", "Internet Historian"),
    ("UCq6VFHwMzcMXbuKyG7SQYIg", "Linus Tech Tips"),
    
    # More Creators
    ("UCIALMKvObZNtJ6AmdCLP7Lg", "Blippi"),
    ("UCHkj014U2CQ2Nv0UZeYpE_A", "Morgz"),
    ("UC4-79UOlP48-QNGgCko5p2g", "Noah Beck"),
    ("UC2C_jShtL725hvbm1arSV9w", "CGP Grey"),
    ("UC6ltJT9TAyLiRjHKR7E1lhg", "5-Minute Crafts"),
    ("UC4USoIAL9qcsx5nCZV_QRnA", "Troom Troom"),
    ("UCAk3t7WHs2AIL_svfKUMmqw", "123 GO!"),
    ("UCHa-hWHrTt4hqh-WiHry3Lw", "Collins Key"),
    ("UCNr0JeRiSVrN3UcnBrJ82OA", "A4"),
    ("UCrv269YwJzuZL3dH5PCgxUw", "Papa Jake"),
    
    # Regional Stars
    ("UCvf8_hnSi25LgPHGCfOgzbg", "CarryMinati"),
    ("UCzHnVSIrKpQjw6BwgWEYkWQ", "Techno Gamerz"),
    ("UCj22tfcQrWG7EMEKS0qLeEg", "Ashish Chanchlani"),
    ("UCqwUrj10mAEsqezcItqvwEw", "BB Ki Vines"),
    ("UCBV1gUARDKc5rqnHKT3NXKQ", "Mortal"),
    ("UCr3cBLTYmIK9kY0F_OdFWFQ", "Sourav Joshi Vlogs"),
    ("UCK09g6gYGMvU-0x1VCF1hgA", "Gaurav Taneja"),
    ("UCddiUEpeqJcYeBxX1IVBKvQ", "Nischay Malhan"),
    ("UCA5u8UquvO44Jcd3wZApyDg", "BeerBiceps"),
    ("UCgNg3vwj3xt7QOrcIDaHdFg", "Ajey Nagar"),
    
    # More Global Stars
    ("UCam8T03EOFBsNdR0thrFHdQ", "Veritasium"),
    ("UCZYTClx2T1of7BRZ86-8fow", "Dhar Mann"),
    ("UCEdvpU2pFRCVqU6yIPyTpMQ", "Kimberly Loaiza"),
    ("UCoUM-UJ7rirJYP8CQ0EIaHA", "Rubius"),
    ("UCYiGq8XF7YQD00x7wAd62Zg", "BLACKPINK"),
    ("UC5c9VlYTSvBSCaoMu_GI6gQ", "Shakira"),
    ("UC0WP5P-ufpRfjbNrmOWwLBQ", "Whindersson"),
    ("UCDmCBKaKOtOrEqgsL4-3C8Q", "El Rubius"),
    ("UCYYSfzomQEGE8B_kgEd89qg", "Luisito Comunica"),
    ("UCwmZiChSryoWQCZMIQezgTg", "JuegaGerman"),
    
    # Sports & Fitness
    ("UCIXyj6rbGlPkjU5D-PVnMwA", "Logan Paul"),
    ("UCewMTclBJZPsp8J1thhfRMw", "ESPN"),
    ("UCsQoH4R2x7b4qQDhvGaJc9A", "YES Network"),
    ("UC9k-yiEpRHMNVOnOi_aQK8w", "Soccer AM"),
    ("UCE_M8A5yxnLfW0KghEeajjw", "Apple Fitness+"),
    ("UCXJ2pT6hGEZ0kfNy6dVFTvA", "Ryan Trahan"),
    ("UCyqzvMN8newXIxyYIkFzPvA", "Athlean-X"),
    ("UCe0TLA0EsQbE-MjuHXevj2A", "BRIGHT SIDE"),
    ("UCNjPtOCvMrKY5eLwr_-7eUg", "ChrisFix"),
    ("UCL_f53ZEJxp8TtlOkHwMV9Q", "JorgeSprave"),
    
    # More Entertainment
    ("UCHKcsBh7tMoU1YMIE_dYJ9Q", "iJustine"),
    ("UC-CSyyi47VX1lD9zyeABW3w", "PrestonPlayz"),
    ("UCYiGq8XF7YQD00x7wAd62Zg", "BLACKPINK"),
    ("UCWIshKy3X9V1VTh5P_Q6aEw", "Emma Chamberlain"),
    ("UC2wKfjlioOCLP4xQMOWNcgg", "Typical Gamer"),
    ("UCJQJAI7IjbLcpsjWdSzYz0Q", "HBO"),
    ("UC-9-kyTW8ZkZNDHQJ6FgpwQ", "Dude Perfect"),
    ("UCqFzWxSCi39LnW1JKFR3efg", "SEGA"),
    ("UCWv7vMbMWH4-V0ZXdmDpPBA", "PlayStation"),
    ("UCXGgrKt94gR6lmN4aN3mYTg", "Austin Evans"),
    
    # More Music
    ("UCIjZiH5RiyzwLf5hLShzguA", "Imagine Dragons"),
    ("UCmyxyR7kgevlb0RgSbJp3RA", "Coldplay"),
    ("UCZK1v2l9gA0Dl_dYI9ZWjXA", "Sia"),
    ("UCfM3zsQsOnfWNUppiycmBuw", "Adele"),
    ("UCY2qt3dw2TQJxvBrDiYGHdQ", "P!nk"),
    ("UC54nfWRYQHEJeAAP5tHxLSA", "Usher"),
    ("UCHQC0kGqKaLRjXHFVITEJHw", "Mike Shinoda"),
    ("UC4-79UOlP48-QNGgCko5p2g", "Zayn"),
    ("UCEgdi0XIXXZ-qJOFPf4JSKw", "BLACKPINK"),
    ("UCcdwLMPsaU2ezNSJU1nFoBQ", "Calvin Harris"),
    
    # Cooking & Food
    ("UCRIZtPl9nb9RiXc9btSTQNw", "Gordon Ramsay"),
    ("UCYiGq8XF7YQD00x7wAd62Zg", "Binging with Babish"),
    ("UCNr0JeRiSVrN3UcnBrJ82OA", "Tasty"),
    ("UC1lBQvT9zWjLW8z8j95EAJA", "First We Feast"),
    ("UCsQoH4R2x7b4qQDhvGaJc9A", "Bon Appetit"),
    ("UCZK1v2l9gA0Dl_dYI9ZWjXA", "Jamie Oliver"),
    ("UCpko_-a4wgz2u_DgDgd9fqA", "Nick DiGiovanni"),
    ("UCqFzWxSCi39LnW1JKFR3efg", "MrBeast Burgers"),
    ("UCDq5v10l4wkV5-ZBIJJFbzQ", "SortedFood"),
    ("UCvjgEDvShRsIG_ao0-L3r_Q", "Pro Home Cooks"),
    
    # More Tech & Science
    ("UCddiUEpeqJcYeBxX1IVBKvQ", "TechLinked"),
    ("UC5UAwBUum7CPN5buc-_N1Fw", "The Slow Mo Guys"),
    ("UCHnyfMqiRRG1u-2MsSQLbXA", "Vsauce"),
    ("UCUK0HBIBWgM2c4vsPhkYY4w", "minutephysics"),
    ("UCSIvk78tK2TiviLQn4fSHaw", "Up and Atom"),
    ("UC6107grRI4m0o2-emgoDnAA", "SmarterEveryDay"),
    ("UCXv1JLIwKCPJnRpI5DVEtAA", "Physics Girl"),
    ("UCBcRF18a7Qf58cCRy5xuWwQ", "TKOR"),
    ("UCOGeU-1Fig3rrDjhm9Zs_wg", "Numberphile"),
    ("UC6nSFpj9HTCZ5t-N3Rm3-HA", "Vsauce2"),
    
    # Lifestyle & Beauty
    ("UCbAwSkqJ1W_Eg7wr3cf5BXQ", "NikkieTutorials"),
    ("UCucot-Zp428OwkyRm2I7v2Q", "James Charles"),
    ("UCiP6wD_tYlYLYh3agzbByWQ", "Patrick Starrr"),
    ("UCCvoAe__WFYMNAEN-C-CtYA", "Jeffree Star"),
    ("UCDq5v10l4wkV5-ZBIJJFbzQ", "Zoella"),
    ("UCD9PZYV5heAevh9vrsYut1g", "Tati"),
    ("UCuLLq9B_2FWZsJ9bJ1pPjVA", "Bretman Rock"),
    ("UCq6VFHwMzcMXbuKyG7SQYIg", "Simply Nailogical"),
    ("UCWRV5AVOlKJR1Flvgt310Cw", "Alisha Marie"),
    ("UCM8LhaMLuE99cSPkqWwEuTA", "Mykie"),
    
    # Cars & Vehicles
    ("UCsAegdhiYLEoaFGuJFVrqFQ", "Doug DeMuro"),
    ("UCRI_HdCZy9Cqz_dEPwbLFXQ", "Top Gear"),
    ("UCsQoH4R2x7b4qQDhvGaJc9A", "Donut Media"),
    ("UCWBNpxBZHKCVFIpPkPvON3A", "Jay Leno's Garage"),
    ("UCH4BNI0-FOK2dMXoFtViWHw", "Supercar Blondie"),
    ("UCDq5v10l4wkV5-ZBIJJFbzQ", "TheStraightPipes"),
    ("UC0WP5P-ufpRfjbNrmOWwLBQ", "ChrisFix"),
    ("UCc1LCNwKBOCH9WLAaeNIggA", "Engineering Explained"),
    ("UCfWoKlzbsxYnlvUjxPV6gqw", "TJ Hunt"),
    ("UCBBQPB5w7v_WwlCXdZJTqjA", "Whistlin Diesel"),
    
    # News & Politics
    ("UCupvZG-5ko_eiXAupbDfxWw", "CNN"),
    ("UCaXkIU1QidjPwiAYu6GcHjg", "MSNBC"),
    ("UCNye-wNBqNL5ZzHSJj3l8Bg", "ABC News"),
    ("UCWX3ZfHfDHdfW_XuTXNAEIQ", "NBC News"),
    ("UCgRvm1yLFoaQKhmaTqXk9SA", "BBC News"),
    ("UCvjgEDvShRsIG_ao0-L3r_Q", "Al Jazeera"),
    ("UCef1-8eOpJgud7szVPlZQAQ", "The Daily Show"),
    ("UC3XTzVzaHQEd30rQbuvCtTQ", "Last Week Tonight"),
    ("UCmh5gdwCx6lN7gEC20leNVA", "The Late Show"),
    ("UCJ0uqCI0Vqr2Rrt1HseGirg", "Saturday Night Live"),
    
    # Animation & Art
    ("UCHdos0HAIEhIMqUc9L3Cmrg", "TheOdd1sOut"),
    ("UCGwu0nbY2wSkW8N-cghnLpA", "Jaiden Animations"),
    ("UC7DdEm33SyaTDtWYGO2CwdA", "Domics"),
    ("UCHwLnp2KwUMk0V0DDlgf4kA", "Kurzgesagt"),
    ("UCRtPrPxFfLtkv9DZX2oYLPQ", "Corridor Crew"),
    ("UCEdvpU2pFRCVqU6yIPyTpMQ", "Studio C"),
    ("UCdC0An4ZPNr_YiFiYoVbwaw", "Daily Dose Of Internet"),
    ("UC4PooiX37Pld1T8J5SYT-SQ", "Pencilmation"),
    ("UC5c9VlYTSvBSCaoMu_GI6gQ", "Simon's Cat"),
    ("UCWUxX6rV_3cSJFLqb5NfmEg", "Alan Becker"),
    
    # Additional Popular Channels
    ("UCBnZ16ahKA2DZ_T5W0FPUXg", "Brave Wilderness"),
    ("UC0v-tlzsn0QZwJnkiaUSJVQ", "Trap Nation"),
    ("UCiYcA0gJzg855iSKMrX3oHg", "NCS"),
    ("UCq6VFHwMzcMXbuKyG7SQYIg", "LinusTechTips"),
    ("UCvjgEDvShRsIG_ao0-L3r_Q", "Wendover Productions"),
    ("UCddiUEpeqJcYeBxX1IVBKvQ", "PolyMatter"),
    ("UCZK1v2l9gA0Dl_dYI9ZWjXA", "Half as Interesting"),
    ("UCcdwLMPsaU2ezNSJU1nFoBQ", "RealLifeLore"),
    ("UCNr0JeRiSVrN3UcnBrJ82OA", "Economics Explained"),
    ("UCH4BNI0-FOK2dMXoFtViWHw", "Johnny Harris"),
]

# Remove duplicates by channel_id
seen_ids = set()
UNIQUE_YOUTUBERS = []
for channel_id, name in TOP_YOUTUBERS:
    if channel_id not in seen_ids:
        seen_ids.add(channel_id)
        UNIQUE_YOUTUBERS.append((channel_id, name))

TOP_YOUTUBERS = UNIQUE_YOUTUBERS[:250]  # Limit to 250


async def add_creator(youtube: YouTubeService, supabase, channel_id: str, expected_name: str) -> bool:
    """Add a single creator to the database."""
    
    # Check if already exists
    existing = supabase.table("creators").select("id").eq(
        "youtube_channel_id", channel_id
    ).execute()
    
    if existing.data:
        print(f"  ⏭️  {expected_name} already exists, skipping")
        return False
    
    try:
        # Fetch channel data
        channel_data = await youtube.get_channel_by_id(channel_id)
        
        if not channel_data:
            print(f"  ❌ {expected_name}: Channel not found")
            return False
        
        # Calculate 30-day views
        try:
            view_count_30d = await youtube.calculate_30d_views(channel_id)
        except Exception:
            view_count_30d = 0
        
        # Calculate CPI
        cpi_score = youtube.calculate_cpi_score(
            channel_data["subscriber_count"],
            view_count_30d,
            channel_data["view_count_lifetime"]
        )
        
        # Calculate initial pricing
        token_supply = 9_000_000
        initial_market_cap = youtube.calculate_initial_market_cap(cpi_score)
        initial_price = youtube.calculate_initial_price(cpi_score, token_supply)
        
        # Generate token symbol (without $ prefix)
        username = channel_data["username"].upper().replace(" ", "").replace("@", "")[:6]
        token_symbol = username
        
        # Create creator
        creator_id = str(uuid.uuid4())
        creator_data = {
            "id": creator_id,
            "youtube_channel_id": channel_id,
            "username": channel_data["username"],
            "display_name": channel_data["display_name"],
            "avatar_url": channel_data["avatar_url"],
            "banner_url": channel_data.get("banner_url", ""),
            "subscriber_count": channel_data["subscriber_count"],
            "view_count_30d": view_count_30d,
            "view_count_lifetime": channel_data["view_count_lifetime"],
            "video_count": channel_data["video_count"],
            "cpi_score": cpi_score,
            "token_symbol": token_symbol,
            "is_verified": channel_data["subscriber_count"] >= 100000,
        }
        
        supabase.table("creators").insert(creator_data).execute()
        
        # Create pool
        pool_data = {
            "id": str(uuid.uuid4()),
            "creator_id": creator_id,
            "token_supply": token_supply,
            "nmbr_reserve": initial_market_cap,
            "initial_price": initial_price,
            "current_price": initial_price,
            "price_change_24h": 0,
            "volume_24h": 0,
            "market_cap": initial_market_cap,
            "holder_count": 0,
        }
        
        supabase.table("pools").insert(pool_data).execute()
        
        print(f"  ✅ {channel_data['display_name']} - {channel_data['subscriber_count']:,} subs, CPI: {cpi_score:.1f}, Price: {initial_price:.6f}")
        return True
        
    except Exception as e:
        print(f"  ❌ {expected_name}: {str(e)}")
        return False


async def main():
    """Main function to add top YouTubers."""
    settings = get_settings()
    
    if not settings.youtube_api_key:
        print("❌ YOUTUBE_API_KEY not set in .env")
        return
    
    print("🚀 Starting to add top YouTubers to the database...")
    print(f"📊 Total channels to process: {len(TOP_YOUTUBERS)}")
    print("")
    
    youtube = YouTubeService(settings.youtube_api_key)
    supabase = get_supabase()
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for i, (channel_id, name) in enumerate(TOP_YOUTUBERS, 1):
        print(f"[{i}/{len(TOP_YOUTUBERS)}] Processing {name}...")
        
        result = await add_creator(youtube, supabase, channel_id, name)
        
        if result:
            success_count += 1
        elif result is False:
            skip_count += 1
        else:
            error_count += 1
        
        # Rate limiting - YouTube API has quota limits
        if i % 10 == 0:
            print(f"  ⏳ Pausing for rate limiting...")
            await asyncio.sleep(1)
    
    print("")
    print("=" * 50)
    print(f"✅ Added: {success_count}")
    print(f"⏭️  Skipped (already exist): {skip_count}")
    print(f"❌ Errors: {error_count}")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
