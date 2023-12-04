<div align="center">
<h1 align="center">
<img src="https://raw.githubusercontent.com/kevinbuckley/choose-your-hero/main/web/public/chooseyourhero.png" width="300" />
<br>CHOOSE-YOUR-HERO</h1>
<h3>Developed with the software and tools below.</h3>

<p align="center">
<img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=flat-square&logo=HTML5&logoColor=white" alt="HTML5" />
<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat-square&logo=Vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/OpenAI-412991.svg?style=flat-square&logo=OpenAI&logoColor=white" alt="OpenAI" />
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat-square&logo=TypeScript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/tsnode-3178C6.svg?style=flat-square&logo=ts-node&logoColor=white" alt="tsnode" />
<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat-square&logo=JSON&logoColor=white" alt="JSON" />
</p>
</div>

---

## 📖 Table of Contents

- 📖 [Table of Contents](#-table-of-contents)
- 📍 [Overview](#-overview)
- 📂 [Repository Structure](#-repository-structure)
- 🚀 [Getting Started](#-getting-started)
  - 🔧 [Installation](#-installation)
  - 🤖 [Running choose-your-hero](#-running-choose-your-hero)

---

## 📍 Overview

Daily, simple card game for everyone. The entire game changes daily! Not only the heroes, but their mechanics (health and attack power).

Check back every day to choose your hero!   Please add an [Issue](https://github.com/kevinbuckley/choose-your-hero/issues) with new theme ideas!

---

## Generator

### 📂 Repository Structure

```sh
└── choose-your-hero/
    ├── generator/
    │   ├── main-simulator.ts
```

Used to generate the new game file and assets daily. Here's the process:

Step 1: Given a theme, use OpenAI to generate the game_file.json, including all heroes, health, and attack power

Step 2: Run a simulation of the game 100 times to determine if it's a fair and fun game for people to play. If not, go back to step 1.

Step 3: Use OpenAI to generate the card images for each hero.

---

## Web

### 📂 Repository Structure
```sh
└── choose-your-hero/
    └── web/
    │   ├── mechanics
    │   ├── scenes
```

The generated game, including:

mechanics: The core game logic that can be simulated determine if it's fun.

scenes: The UI code using Phaser JS

---

## 🚀 Getting Started

### 🔧 Installation

1. Clone the choose-your-hero repository:

```sh
git clone https://github.com/kevinbuckley/choose-your-hero
```

2. Change to the project directory:

```sh
cd choose-your-hero
cd web
```

3. Install the dependencies:

```sh
npm install
```

### 🤖 Running choose-your-hero

```sh
npm run start
```

---
