import { useState, useEffect } from 'react';
import { api } from '../services/api';
// @ts-ignore
import Lenis from 'lenis';
import '../App.css';
// import InteractiveGrid from '../components/InteractiveGrid';
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

function LandingPage() {
    const [tickerItems, setTickerItems] = useState<any[]>([]);
    const [tickerVisible, setTickerVisible] = useState(false);

    useEffect(() => {
        const fetchTickerData = async () => {
            try {
                // Fetch top creators by volume
                const response = await api.getCreators({ limit: 15, sortBy: 'volume_24h' });
                const items = response.creators.map(c => {
                    // Calculate percentage change
                    // change is absolute. previous_price = current - change
                    // pct = (change / previous) * 100
                    const change = c.price_change_24h;
                    const price = c.current_price;
                    const prevPrice = price - change;
                    let pct = 0;
                    if (prevPrice !== 0) {
                        pct = (change / prevPrice) * 100;
                    }

                    return {
                        symbol: c.token_symbol,
                        price: `$${price.toFixed(3)}`,
                        change: change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
                        pctChange: change > 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`
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
