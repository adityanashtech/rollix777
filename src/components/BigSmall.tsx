import React, { useCallback, useEffect, useState } from "react";
import { X, ArrowLeft, Clock, Check } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store";

type Record = {
  id: number;
  period: string;
  number: string;
  color: string;
  small_big: string;
  mins: string;
};

type Bet = {
  period: number;
  number?: number | null; // Optional
  color?: string; // Optional
  big_small?: string; // Optional
  amount: number;
};

const BigSmall = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [timeLeft, setTimeLeft] = useState(120); // Default 2 min
  const [isRunning, setIsRunning] = useState(false);
  const [activeTime, setActiveTime] = useState<number | null>(1); // Default to 1 min
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<"big" | "small" | "">("");
  const [contractMoney, setContractMoney] = useState<number>(0);
  const [agreed, setAgreed] = useState(false);
  const [selected, setSelected] = useState(1);
  const [records, setRecords] = useState<Record[]>([]); // State to store fetched data
  const [shouldResetTimer, setShouldResetTimer] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<number>(0);
  const [bets, setBets] = useState<Bet[]>([]);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [winner, setWinner] = useState(false);

  const handeleWinLose = useCallback(
    async (record: Record, bets: Bet[]): Promise<boolean> => {
      const winningBet = bets.find((bet) => {
        if (parseInt(record.period) !== bet.period) return false; // Check period first

        // Check in sequence: number -> color -> big_small
        if (bet.number !== null && parseInt(record.number) !== bet.number)
          return false;
        if (bet.color && record.color !== bet.color) return false;
        if (bet.big_small && record.small_big !== bet.big_small) return false;

        return true; // All conditions passed, it's a win
      });

      if (winningBet) {
        const payoutAmount = winningBet.amount * 1.9;
        try {
          const response = await axios.put(
            "https://rollix777.com/api/user/wallet/balance",
            {
              userId,
              cryptoname: "INR",
              balance: payoutAmount,
            }
          );

          if (response.status === 200) {
            console.log(`Payout successful: ${payoutAmount}`);
            return true; // Win and payout successful
          } else {
            console.log("Payout failed.");
            return false; // Win but payout failed
          }
        } catch (error) {
          console.error("API error:", error);
          return false; // Win but API error
        }
      } else {
        return false; // No win
      }
    },
    [userId]
  );

  const fetchRecord = useCallback(async () => {
    try {
      const response = await axios.get<Record[]>(
        `https://rollix777.com/api/color/result/${activeTime}min?mins=${activeTime}min`
      );
      if (!response) {
        console.log("failed to fetch");
      }
      const data = response.data;
      console.log(data);
      setRecords(data);
      if (bets.length !== 0) {
        setWinner(await handeleWinLose(data[0], bets));
      }
      const period = Number(data[0].period);
      setCurrentPeriod(period + 1);
    } catch (error) {
      console.log(error);
    }
  }, [activeTime, bets, handeleWinLose]);

  const getResult = async () => {
    try {
      const response = await axios.post(
        "https://rollix777.com/api/color/result",
        {
          mins: "1min",
          period: currentPeriod,
        }
      );
      if (!response) {
        console.log("failed to fetch");
      }
      const data = response.data;
      console.log(data);
      fetchRecord();
    } catch (error) {
      console.log(error);
    }
  };

  const handleBet = async (bet: Bet) => {
    try {
      const response = await axios.post(
        `https://rollix777.com/api/wallet/withdrawl`,
        {
          userId,
          balance: String(bet.amount),
          cryptoname: "INR",
          status: "0",
        }
      );

      if (!response) {
        console.log("failed to place bet");
        return;
      }

      setBets((prev) => [...prev, bet]);
      setSelectedNumber(null);
      setSelectedColor("");
      setSelectedSize("");
    } catch (error) {
      console.log("failed with error", error);
    }
  };

  useEffect(() => {
    // Initialize with some data for 1 min timer
    initializeData(1);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft === 0) {
      // Timer completed, now reset with the active time
      if (activeTime) {
        setTimeLeft(activeTime * 60);
        // Generate new data when timer completes
        getResult();
        setBets([]);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, activeTime]);

  // Initialize data without resetting timer
  const initializeData = (minutes: number) => {
    setActiveTime(minutes);
    setSelected(minutes);
    setTimeLeft(minutes * 60);
    generateMockData();
  };

  // Handle time selection without resetting the current timer
  const handleTimeSelect = (minutes: number) => {
    // Only update the active time, don't reset the current timer
    setActiveTime(minutes);
    setSelected(minutes);

    // Generate new data for the selected time period
    generateMockData();
  };

  // Generate mock data for the game records
  const generateMockData = () => {
    try {
      const mockData = Array.from({ length: 20 }, (_, i) => ({
        period: `20250227${Math.floor(1000 + Math.random() * 9000)}`,
        number: Math.floor(Math.random() * 10),
        color: Math.random() > 0.5 ? "green" : "red",
        small_big: Math.random() > 0.5 ? "Small" : "Big",
      }));
      // setRecords(mockData);
    } catch (error) {
      console.error("Error generating mock data:", error);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  console.log(bets);
  return (
    <div className="pt-16 pb-24 bg-[#0F0F19]">
      <div className="w-full mx-auto bg-gradient-to-b from-[#252547] to-[#1A1A2E] text-white p-4 space-y-4 rounded-lg">
        {/* Header with back button */}
        <div className="flex items-center mb-4">
          <Link
            to="/"
            className="p-2 rounded-lg bg-[#252547] text-purple-400 hover:bg-[#2f2f5a] transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-white ml-4">
           Wingo
          </h1>
        </div>

        {/* Time Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 3, 5, 10].map((min) => (
            <button
              key={min}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                activeTime === min
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-[#252547] border border-purple-500/20 text-gray-300 hover:bg-[#2f2f5a]"
              }`}
              onClick={() => handleTimeSelect(min)}
            >
              {min} min
            </button>
          ))}
        </div>

        {/* Period Display */}
        <div className="flex items-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-4 py-3 rounded-lg border border-purple-500/20">
          <span className="mr-2">🏆</span>
          <span className="font-bold">Period</span>
          <span className="ml-auto">{currentPeriod}</span>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center justify-center gap-2 bg-[#252547] border border-purple-500/20 text-center py-3 px-4 rounded-lg ${
            timeLeft < 10 ? "bg-red-500/20 border-red-500/30" : ""
          }`}
        >
          <Clock
            className={`w-5 h-5 ${
              timeLeft < 10 ? "text-red-400" : "text-purple-400"
            }`}
          />
          <span
            className={`font-bold ${
              timeLeft < 10 ? "text-red-400" : "text-white"
            }`}
          >
            Time Left: {formatTime(timeLeft)}
          </span>
        </div>

        {/* Join Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`px-4 py-3 rounded-lg font-medium ${
              timeLeft < 10
                ? "bg-[#252547] border border-green-500/20 text-gray-400 cursor-not-allowed"
                : "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"
            }`}
            disabled={timeLeft < 10}
            onClick={() => setSelectedColor("green")}
          >
            Join Green
          </button>

          <button
            className={`px-4 py-3 rounded-lg font-medium ${
              timeLeft < 10
                ? "bg-[#252547] border border-purple-500/20 text-gray-400 cursor-not-allowed"
                : "bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
            }`}
            disabled={timeLeft < 10}
            onClick={() => setSelectedColor("voilet")}
          >
            Join Violet
          </button>

          <button
            className={`px-4 py-3 rounded-lg font-medium ${
              timeLeft < 10
                ? "bg-[#252547] border border-red-500/20 text-gray-400 cursor-not-allowed"
                : "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
            }`}
            disabled={timeLeft < 10}
            onClick={() => setSelectedColor("red")}
          >
            Join Red
          </button>
        </div>

        {/* 0-9 Number Buttons */}
        <div className="p-2 bg-[#1A1A2E] rounded-lg border border-purple-500/10">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => (
              <button
                key={i}
                onClick={() => timeLeft >= 10 && setSelectedNumber(i)}
                disabled={timeLeft < 10}
                className={`relative px-0 py-3 text-white font-bold rounded-lg ${
                  timeLeft < 10
                    ? "bg-[#252547] border border-gray-600/20 text-gray-500 cursor-not-allowed"
                    : i === 0
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                    : i % 2 === 0
                    ? "bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90"
                    : "bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Big & Small Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`px-4 py-3 rounded-lg font-medium ${
              timeLeft < 10
                ? "bg-[#252547] border border-red-500/20 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90"
            }`}
            disabled={timeLeft < 10}
            onClick={() => setSelectedSize("big")}
          >
            Big
          </button>
          <button
            className={`px-4 py-3 rounded-lg font-medium ${
              timeLeft < 10
                ? "bg-[#252547] border border-green-500/20 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-500 text-white hover:opacity-90"
            }`}
            disabled={timeLeft < 10}
            onClick={() => setSelectedSize("small")}
          >
            Small
          </button>
        </div>

        {/* Record Table */}
        <div className="bg-gradient-to-br from-[#252547] to-[#1A1A2E] rounded-xl border border-purple-500/20 overflow-hidden mt-6">
          <div className="p-4 border-b border-purple-500/10">
            <h2 className="text-xl font-bold text-white">
              🏆 {selected} min Record
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-purple-500/10">
                  <th className="py-4 px-6 font-medium">Period</th>
                  <th className="py-4 px-6 font-medium">Number</th>
                  <th className="py-4 px-6 font-medium">Result</th>
                  <th className="py-4 px-6 font-medium">Size</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length > 0 ? (
                  currentRecords.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-purple-500/10 text-white hover:bg-purple-500/5"
                    >
                      <td className="py-4 px-4">{record.period}</td>
                      <td className="py-4 px-4">{record.number}</td>
                      <td className="py-4 px-4">
                        {Number(record.number) === 0
                          ? "🟣"
                          : record.color === "green"
                          ? "🟢"
                          : "🔴"}
                      </td>
                      <td className="py-4 px-4">{record.small_big}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">
                      No records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-purple-500/10 flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              Showing {indexOfFirstRecord + 1}-
              {Math.min(indexOfLastRecord, records.length)} of {records.length}{" "}
              records
            </p>
            <div className="flex gap-2">
              <button
                className="py-1 px-3 bg-[#1A1A2E] border border-purple-500/20 rounded-lg text-gray-400 hover:text-white transition-colors"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show first page, last page, current page, and pages around current
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  pageToShow = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + i;
                } else {
                  pageToShow = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    className={`py-1 px-3 rounded-lg ${
                      currentPage === pageToShow
                        ? "bg-purple-500/20 border border-purple-500/20 text-white"
                        : "bg-[#1A1A2E] border border-purple-500/20 text-gray-400 hover:text-white transition-colors"
                    }`}
                    onClick={() => setCurrentPage(pageToShow)}
                  >
                    {pageToShow}
                  </button>
                );
              })}

              <button
                className="py-1 px-3 bg-[#1A1A2E] border border-purple-500/20 rounded-lg text-gray-400 hover:text-white transition-colors"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {(selectedNumber !== null || selectedColor || selectedSize) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#252547] to-[#1A1A2E] rounded-2xl overflow-hidden animate-fadeIn">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-purple-500/10">
              <h2 className="text-xl font-bold text-white">
                {selectedNumber !== null
                  ? `Number ${selectedNumber} Selected`
                  : selectedColor
                  ? `${selectedColor} Selected`
                  : `${selectedSize} Selected`}
              </h2>
              <button
                onClick={() => {
                  setSelectedNumber(null);
                  setSelectedColor("");
                  setSelectedSize("");
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A2E] text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-300">Contract Money</label>
                <input
                  min={10}
                  step={10}
                  type="number"
                  placeholder="Enter amount (Minimum ₹10)"
                  value={contractMoney}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 100000) {
                      setContractMoney(100000); // Reset to max limit
                    } else {
                      setContractMoney(value);
                    }
                  }}
                  className="w-full py-3 px-4 bg-[#1A1A2E] border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Error Message or Success Message */}
              {contractMoney > 100000 ? (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  Contract money cannot exceed ₹100,000
                </div>
              ) : contractMoney >= 10 ? (
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">
                  Total contract money is ₹{contractMoney}
                </div>
              ) : null}

              {/* Checkbox */}
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center mr-3 cursor-pointer ${
                    agreed
                      ? "bg-purple-600"
                      : "bg-[#1A1A2E] border border-purple-500/20"
                  }`}
                  onClick={() => setAgreed(!agreed)}
                >
                  {agreed && <Check className="w-4 h-4 text-white" />}
                </div>
                <label
                  className="text-sm text-gray-300 cursor-pointer"
                  onClick={() => setAgreed(!agreed)}
                >
                  I agree to the{" "}
                  <span className="text-purple-400">terms and conditions</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="p-5 border-t border-purple-500/10 flex gap-3">
              <button
                onClick={() => {
                  setSelectedNumber(null);
                  setSelectedColor("");
                  setSelectedSize("");
                }}
                className="flex-1 py-3 px-4 bg-[#1A1A2E] border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Cancel
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-lg text-white font-medium ${
                  agreed && contractMoney >= 10 && contractMoney <= 100000
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity"
                    : "bg-gray-600/50 cursor-not-allowed"
                }`}
                disabled={
                  !agreed || contractMoney < 10 || contractMoney > 100000
                }
                onClick={() =>
                  handleBet({
                    period: currentPeriod,
                    number: selectedNumber,
                    color: selectedColor,
                    big_small:
                      selectedSize ??
                      (selectedNumber &&
                      selectedNumber !== 0 &&
                      selectedNumber >= 5
                        ? "big"
                        : "small"),
                    amount: contractMoney,
                  })
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#252547] to-[#1A1A2E] rounded-2xl overflow-hidden animate-fadeIn">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-purple-500/10">
              <h2 className="text-xl font-bold text-white">Winner</h2>
              <button
                onClick={() => setWinner(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1A2E] text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-green-600">Winner</label>
              </div>
            </div>

            {/* Buttons */}
            <div className="p-5 border-t border-purple-500/10 flex gap-3">
              <button
                onClick={() => setWinner(false)}
                className="flex-1 py-3 px-4 bg-[#1A1A2E] border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BigSmall;
