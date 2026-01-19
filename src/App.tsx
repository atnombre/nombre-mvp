import React, { useState, useEffect } from 'react';
import './App.css';
import InteractiveGrid from './components/InteractiveGrid';
import InfiniteTicker from './components/InfiniteTicker';
import Header from './components/Header';

function App() {
    const [tickerVisible, setTickerVisible] = useState(false);

    useEffect(() => {
        const handleInteraction = () => {
            setTickerVisible(true);
            // Remove listeners once activated
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('mousemove', handleInteraction);
        };

        window.addEventListener('scroll', handleInteraction);
        window.addEventListener('click', handleInteraction);
        window.addEventListener('mousemove', handleInteraction);

        return () => {
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('mousemove', handleInteraction);
        };
    }, []);

    return (
        <>
            <Header />
            <InteractiveGrid
                color="#FFFFFF"
                backgroundColor="#0a0a0a"
                opacity={0}
                lineWidth={0.3}
                spacing={80}
                glowRadius={120}
                fadeEffect={true}
            />

            <main style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                {/* Text Removed as requested */}
            </main>

            <InfiniteTicker
                items={[
                    { symbol: "NVDA", price: "$186.23", change: "-0.82", pctChange: "-0.44%" },
                    { symbol: "AAPL", price: "$175.40", change: "+1.20", pctChange: "+0.69%" },
                    { symbol: "TSLA", price: "$240.50", change: "-5.10", pctChange: "-2.08%" },
                    { symbol: "GOOGL", price: "$135.80", change: "+0.90", pctChange: "+0.67%" },
                    { symbol: "AMZN", price: "$128.90", change: "+0.45", pctChange: "+0.35%" },
                    { symbol: "MSFT", price: "$330.10", change: "-1.50", pctChange: "-0.45%" },
                    { symbol: "BTC", price: "$42,500", change: "+1200", pctChange: "+2.50%" },
                    { symbol: "ETH", price: "$2,250", change: "+80", pctChange: "+3.10%" },
                ]}
                speed={60}
                visible={tickerVisible}
            />
        </>
    );
}

export default App;
