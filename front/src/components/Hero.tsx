import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';
import { useEffect, useState } from 'react';

const Hero = () => {
    const [proposals, setProposals] = useState<any[]>([]);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const proposalsData = await api.getProposals();
                setProposals(proposalsData);
            } catch (error) {
                console.error('Error fetching proposals:', error);
            }
        };
        fetchProposals();
    }, []);

    return (
        <section id="home" className="pt-24 min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">治理模块</h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">以下是当前的提案列表</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <ul>
                        {proposals.map((proposal, index) => (
                            <li key={index} className="mb-2">
                                {proposal.title}
                            </li>
                        ))}
                    </ul>
                    <Button className="bg-gray-900 hover:bg-gray-800 text-lg py-6 px-8">开始使用</Button>
                    <Button variant="outline" className="text-lg py-6 px-8">
                        了解更多
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
