import React from 'react';
import styles from './index.module.css';

const HomePage: React.FC = () => {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1>Welcome to my Next.js app!</h1>
        <p>This is the default page.</p>
      </div>
    </main>
  );
};

export default HomePage;
