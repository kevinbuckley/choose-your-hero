import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import PhaserGame from '../components/PhaserGame';

// Dynamically import Phaser component
const DynamicPhaserGame = dynamic(() => Promise.resolve(PhaserGame), {
  ssr: false, // Disable server-side rendering for this component
});

const GamePage: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: 800,
        height: 600,
        scene: [DynamicPhaserGame],
      };

      new Phaser.Game(config);
    }
  }, []);

  return <div ref={gameRef} />;
};

export default GamePage;