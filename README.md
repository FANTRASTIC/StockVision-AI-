# StockWise AI 🚀

**An AI-Powered Stock Analysis and Paper Trading Platform built with Next.js and Genkit.**

<img width="1904" height="921" alt="image" src="https://github.com/user-attachments/assets/88e106b4-81cd-4f39-a5d2-a7f76eff4cb2" />


StockWise AI is a modern, web-based platform designed to provide users with powerful tools for stock market analysis and virtual trading. It leverages generative AI to offer predictive insights, risk management recommendations, and real-time market sentiment analysis, all within a sleek and intuitive user interface.

---

## ✨ Features

- **Interactive Dashboard**: A central hub featuring a real-time stock chart, portfolio overview, and a quick-access paper trading widget.
- **Explore Page**: Discover trending stocks, including top daily gainers and losers, most active stocks, and the latest market news driving stock performance.
- **AI-Powered Toolkit**:
    - **Price Forecast**: Get 7-day stock price predictions with trend analysis and confidence scores.
    - **Risk Management**: Receive AI-generated stop-loss and take-profit recommendations based on volatility and market sentiment.
    - **Market Sentiment**: Analyze real-time sentiment from financial news and social media to gauge the market's mood.
- **Paper Trading**: Simulate buying and selling stocks with a virtual portfolio to practice trading strategies without any real-world risk.
- **Custom Watchlist**: Keep track of your favorite stocks and set up price alerts.
- **Responsive Design**: A clean, modern interface that works seamlessly on both desktop and mobile devices.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **AI/Generative**: [Google AI & Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charting**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en) (version 18.x or later recommended)
- `npm` or a compatible package manager

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/stockwise-ai.git
    cd stockwise-ai
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add your Google AI API key. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```env
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

*This project was bootstrapped with Firebase Studio.*
