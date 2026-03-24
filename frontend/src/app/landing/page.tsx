import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { ProductVisualization } from '@/components/landing/ProductVisualization';
import { RAGShowcase } from '@/components/landing/RAGShowcase';
import { TechStack } from '@/components/landing/TechStack';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function LandingPage() {
    return (
        <main className="min-h-screen">
            <HeroSection />
            <FeaturesGrid />
            <ProductVisualization />
            <RAGShowcase />
            <TechStack />
            <FinalCTA />
        </main>
    );
}
