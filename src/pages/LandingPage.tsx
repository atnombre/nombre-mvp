import { useState, useEffect } from 'react';
// @ts-ignore
import Lenis from 'lenis';
import '../App.css';

import InfiniteTicker from '../components/InfiniteTicker';
import Header from '../components/Header';
import FeatureSection from '../components/FeatureSection';
import AmbientBackground from '../components/ui/AmbientBackground';
import CryptoDecorations from '../components/ui/CryptoDecorations';
import FooterSection from '../components/FooterSection';
import CTASection from '../components/CTASection';
import CustomCursor from '../components/ui/CustomCursor';
import TradingSteps from '../components/TradingSteps';
import HeroSection from '../components/HeroSection';

// Lightweight fetch for ticker - avoids importing full API (which pulls supabase)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function LandingPage() {
    const [tickerItems, setTickerItems] = useState<any[]>([]);
    const [tickerVisible, setTickerVisible] = useState(false);

    useEffect(() => {
        const fetchTickerData = async () => {
            try {
                // Direct fetch instead of api.getCreators() to avoid supabase bundle
                const response = await fetch(`${API_URL}/creators?limit=15&sort_by=volume_24h`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();

                const items = data.creators.map((c: any) => {
                    const price = c.current_price;
                    const pct = c.price_change_24h || 0;
                    const prevPrice = price / (1 + (pct / 100));
                    const absChange = price - prevPrice;

                    return {
                        symbol: c.token_symbol,
                        price: `$${price < 1 ? price.toFixed(4) : price.toFixed(2)}`,
                        change: absChange > 0 ? `+${absChange.toFixed(4)}` : absChange.toFixed(4),
                        pctChange: pct > 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`
                    };
                });
                setTickerItems(items);
            } catch (err) {
                console.error("Failed to fetch ticker data", err);
                // Fallback to static data if API fails
                setTickerItems([
                    { symbol: "NVDA", price: "$186.23", change: "-0.82", pctChange: "-0.44%" },
                    { symbol: "AAPL", price: "$175.40", change: "+1.20", pctChange: "+0.69%" },
                    { symbol: "TSLA", price: "$240.50", change: "-5.10", pctChange: "-2.08%" },
                    { symbol: "BTC", price: "$42,500", change: "+1200", pctChange: "+2.50%" },
                ]);
            }
        };

        fetchTickerData();
    }, []);

    // Initialize Smooth Scrolling (Lenis)
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        } as any);

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    // Ticker is now visible immediately (handled by loading screen delay if any)
    useEffect(() => {
        setTickerVisible(true);
    }, []);


    return (
        <>
            <CustomCursor />
            <AmbientBackground />
            <CryptoDecorations />
            <Header />
            {/* InteractiveGrid moved to App.tsx */}

            <HeroSection />

            <FeatureSection />
            <TradingSteps />
            <CTASection />
            <FooterSection />

            <InfiniteTicker
                items={tickerItems.length > 0 ? tickerItems : [
                    { symbol: "LOADING...", price: "...", change: "0", pctChange: "0%" }
                ]}
                speed={80}
                visible={tickerVisible}
                top="4px"
            />
        </>
    );
}

export default LandingPage;
