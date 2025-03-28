import React, { useState, useRef } from "react";
import JDBGames from "../gamesData/gamesData.json";
import axios from "axios";
import CryptoJS from "crypto-js";
import AuthModal from "./AuthModal";
import { useSelector } from "react-redux";
import { RootState } from "../store";

interface GameCarouselProps {
  title: string;
  type: "featured" | "popular";
}

const aesKey = "126c2e86c418427c4aa717f971063e0e";
const serverUrl = "https://api.workorder.icu/proxy";

const encryptAES256 = (data: string, key: string) => {
  const key256 = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.AES.encrypt(data, key256, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

// Generate a random 10-digit number
const generateRandom10Digits = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// Open JS Game Function
const openJsGame = async (game_uid: string, element: HTMLButtonElement) => {
  
  const userId = localStorage.getItem("userId");
  const response = await axios.get(`https://rollix777.com/api/user/wallet/${userId}`);
  const balance = response.data[10].balance;
  console.log(balance);

  console.log(`Game UID: ${game_uid}`);
  console.log(`Button element:`, element);

  const memberAccount = `h43929rollix777${userId}`;
  const transferId = `${memberAccount}_${generateRandom10Digits()}`;
  const timestamp = Date.now();

  try {
    // Step 1: Initialize the payload with a balance of 0
    const initPayload = {
      agency_uid: "fd37fafd6af3eb5af8dee92101100347",
      member_account: memberAccount,
      timestamp,
      credit_amount: "0", // Set balance to 0
      currency_code: "BRL",
      language: "en",
      platform: "2",
      home_url: "https://rollix777.com",
      transfer_id: transferId,
    };

    const initEncryptedPayload = encryptAES256(
      JSON.stringify(initPayload),
      aesKey
    );

    const initRequestPayload = {
      agency_uid: "fd37fafd6af3eb5af8dee92101100347",
      timestamp,
      payload: initEncryptedPayload,
    };

    // Send the initial request to the server
    const initResponse = await axios.post(serverUrl, initRequestPayload);

    if (initResponse.data.code !== 0) {
      console.error("Initialization Error:", initResponse.data.msg);
      alert("Failed to initialize game: " + initResponse.data.msg);
      return;
    }

    console.log("Initialization successful:", initResponse.data);

    // Get the amount to deduct from the user balance
    const afterAmount = initResponse.data.payload.after_amount; // Amount to deduct
    console.log(afterAmount);

    // Step 2: Deduct the user's balance
    const deductPayload = {
      agency_uid: "fd37fafd6af3eb5af8dee92101100347",
      member_account: memberAccount,
      timestamp: Date.now(),
      credit_amount: `-${afterAmount}`, // Deduct the current balance
      currency_code: "BRL",
      language: "en",
      platform: "2",
      home_url: "https://thalaclub.com",
      transfer_id: `${memberAccount}_${generateRandom10Digits()}`,
    };

    const deductEncryptedPayload = encryptAES256(
      JSON.stringify(deductPayload),
      aesKey
    );

    const deductRequestPayload = {
      agency_uid: "fd37fafd6af3eb5af8dee92101100347",
      timestamp: Date.now(),
      payload: deductEncryptedPayload,
    };

    const deductResponse = await axios.post(serverUrl, deductRequestPayload);

    if (deductResponse.data.code !== 0) {
      console.error("Deduct Error:", deductResponse.data.msg);
      alert("Failed to deduct balance: " + deductResponse.data.msg);
      return;
    }

    console.log("Deduct successful:", deductResponse.data);

    // Step 3: Launch the game
    const gamePayload = {
      agency_uid: "fd37fafd6af3eb5af8dee92101100347",
      member_account: memberAccount,
      game_uid: game_uid,
      timestamp: Date.now(),
      credit_amount: "5000",
      currency_code: "BRL",
      language: "en",
      platform: "2",
      home_url: "https://thalaclub.com",
      transfer_id: `${memberAccount}_${generateRandom10Digits()}`,
    };

    const gameEncryptedPayload = encryptAES256(
      JSON.stringify(gamePayload),
      aesKey
    );

    const gameRequestPayload = {
      agency_uid: "fd37fafd6af3eb5af8dee92101100347",
      timestamp: Date.now(),
      payload: gameEncryptedPayload,
    };

    const gameResponse = await axios.post(serverUrl, gameRequestPayload);

    if (gameResponse.data.code !== 0) {
      console.error("Game Launch Error:", gameResponse.data.msg);
      alert("Failed to launch game: " + gameResponse.data.msg);
      return;
    }

    // Fetch the game launch URL
    const gameLaunchUrl = gameResponse.data.payload?.game_launch_url;

    if (!gameLaunchUrl) {
      console.error("Game Launch URL not found.");
      alert("Game launch URL not found.");
      return;
    }

    console.log("Game Launch URL:", gameLaunchUrl);

    // Open the game launch URL in a new tab
    window.open(gameLaunchUrl, "_blank");
  } catch (error) {
    console.error("Error in game launch process:", error);
    alert("An error occurred while launching the game.");
  }
};

const GameCarousel: React.FC<GameCarouselProps> = ({ title, type }) => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const userToken = useSelector((state: RootState) => state.auth.token);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePlayNow = () => {
    if (!userToken) {
      setAuthModalOpen(true); // Open login modal if not logged in
    } else {
      console.log("Redirecting to game...");
      // Implement redirection to the game page here
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const games = JDBGames.filter((game) => game.game_category === "popular");

  return (
    <section className="py-8 px-4 bg-[#1A1A2E] relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={scrollLeft}
       className="text-white bg-purple-900/20 p-2 rounded-full transition-colors hover:bg-purple-700 flex items-center justify-center w-8 h-8"

          >
            &lt;
          </button>
          <button
            onClick={scrollRight}
      className="text-white bg-purple-900/20 p-2 rounded-full transition-colors hover:bg-purple-700 flex items-center justify-center w-8 h-8"

          >
            &gt;
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x hide-scrollbar"
      >
        {games.map((game) => (
          <div key={game.game_uid} className="min-w-[140px] bg-[#252547] rounded-xl border border-purple-500/10 shadow-lg relative">
             <div className="relative">
                <img
                  src={game.icon}
                  alt={game.game_name}
                  onClick={(e) => openJsGame(game.game_uid, e.currentTarget)}
                  className="w-full h-60 object-cover cursor-pointer rounded-xl"
                />
                {/* Game Name Overlay */}
                {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-xl">
                  <h3 className="text-white text-center  font-bold text-lg rounded-lg">
                    {game.game_name}
                  </h3>
                </div> */}
              </div>
          </div>
        ))}
      </div>
      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
        onLoginSuccess={() => setAuthModalOpen(false)}
      />
    </section>
  );
};

export default GameCarousel;