import React, { useState } from "react";
import "./App.css";

// 1. Code Generation function (with or without repeats)
function generateCode(length, allowRepeats) {
  const digits = "0123456789".split("");
  let code = [];

  if (allowRepeats) {
    for (let i = 0; i < length; i++) {
      const randIndex = Math.floor(Math.random() * 10);
      code.push(digits[randIndex]);
    }
  } else {
    code = digits.sort(() => 0.5 - Math.random()).slice(0, length);
  }

  return code.join("");
}

// 2. Component for Code Length Selection
function CodeLengthSelector({ length, setLength }) {
  return (
    <label>
      Code Length:
      <select
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}>
        <option value={4}>4</option>
        <option value={6}>6</option>
        <option value={8}>8</option>
      </select>
    </label>
  );
}

// 3. Component for Difficulty Selection
function DifficultySelector({ difficulty, setDifficulty }) {
  return (
    <label>
      Difficulty:
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}>
        <option value="easy">Easy (no repeats)</option>
        <option value="hard">Hard (with repeats)</option>
      </select>
    </label>
  );
}

// 4. Start Screen
function StartScreen({
  length,
  setLength,
  difficulty,
  setDifficulty,
  onStart,
}) {
  return (
    <div className="start">
      <h1>Crack the Code</h1>
      <CodeLengthSelector length={length} setLength={setLength} />
      <DifficultySelector
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      <button onClick={onStart}>Start Game</button>
    </div>
  );
}

// 5. Guess Input Form
function GuessForm({ guess, setGuess, length, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        maxLength={length}
        autoFocus
        aria-label="Enter your guess"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// 6. List of Guesses with Hint Display
function GuessesList({ guesses, showHint, correctWrongPosition }) {
  return (
    <div className="guesses">
      <h3>Your Guesses</h3>
      <ul>
        {guesses.map((g, i) => (
          <li key={i}>
            {g.guess} - {g.correctDigits} correct
            {showHint && i === guesses.length - 1 && (
              <> | {correctWrongPosition} correct but wrong position</>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 7. Game Screen
function GameScreen({
  guess,
  setGuess,
  length,
  code,
  guesses,
  onGuess,
  onShowHint,
  hintsUsed,
  showHint,
  correctWrongPosition,
  onRestart,
}) {
  return (
    <div className="game">
      <h2>Enter your guess</h2>
      <GuessForm
        guess={guess}
        setGuess={setGuess}
        length={length}
        onSubmit={onGuess}
      />
      <GuessesList
        guesses={guesses}
        showHint={showHint}
        correctWrongPosition={correctWrongPosition}
      />
      <button
        className="hint-btn"
        style={{ marginTop: "1rem" }}
        onClick={onShowHint}
        disabled={hintsUsed >= 3 || guesses.length === 0}
        aria-disabled={hintsUsed >= 3 || guesses.length === 0}>
        Show Hint ({3 - hintsUsed} left)
      </button>
      <button
        className="restart-btn"
        style={{ marginTop: "1rem" }}
        onClick={onRestart}>
        Restart
      </button>
    </div>
  );
}

// 8. Main App Component
function App() {
  // Game state variables
  const [step, setStep] = useState("start");
  const [length, setLength] = useState(4);
  const [difficulty, setDifficulty] = useState("easy");
  const [code, setCode] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Start game handler
  const handleStart = () => {
    const allowRepeats = difficulty === "hard";
    const secretCode = generateCode(length, allowRepeats);
    setCode(secretCode);
    setStep("game");
    setStartTime(Date.now());
    setGuesses([]);
    setGuess("");
    setShowHint(false);
    setHintsUsed(0);
  };

  // Handle a guess submission
  const handleGuess = () => {
    if (guess.length !== length || !/^\d+$/.test(guess)) {
      alert(`Please enter a ${length}-digit number.`);
      return;
    }

    setShowHint(false);

    const correctDigits = code
      .split("")
      .filter((digit, i) => digit === guess[i]).length;

    const newGuess = { guess, correctDigits };
    setGuesses([...guesses, newGuess]);

    if (guess === code) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      alert(
        `Correct! You cracked the code in ${
          guesses.length + 1
        } tries and ${elapsed} seconds.`
      );
      setStep("start");
      setGuesses([]);
      setGuess("");
      setShowHint(false);
      setHintsUsed(0);
    } else {
      setGuess("");
    }
  };

  // Handle showing a hint
  const handleShowHint = () => {
    if (hintsUsed >= 3 || guesses.length === 0) return;
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  };

  // Handle restarting the game
  const handleRestart = () => {
    setStep("start");
    setGuesses([]);
    setGuess("");
    setCode("");
    setHintsUsed(0);
    setShowHint(false);
  };

  // Calculate correct digits in the wrong position for the last guess
  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1].guess : "";
  let correctWrongPosition = 0;
  if (showHint && lastGuess) {
    const codeArr = code.split("");
    const guessArr = lastGuess.split("");
    const usedIndicesCode = [];
    const usedIndicesGuess = [];

    for (let i = 0; i < length; i++) {
      if (guessArr[i] === codeArr[i]) {
        usedIndicesCode.push(i);
        usedIndicesGuess.push(i);
      }
    }

    for (let i = 0; i < length; i++) {
      if (usedIndicesGuess.includes(i)) continue;
      for (let j = 0; j < length; j++) {
        if (
          i !== j &&
          !usedIndicesCode.includes(j) &&
          guessArr[i] === codeArr[j]
        ) {
          correctWrongPosition++;
          usedIndicesCode.push(j);
          break;
        }
      }
    }
  }

  return (
    <div className="app">
      {step === "start" && (
        <StartScreen
          length={length}
          setLength={setLength}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onStart={handleStart}
        />
      )}

      {step === "game" && (
        <GameScreen
          guess={guess}
          setGuess={setGuess}
          length={length}
          code={code}
          guesses={guesses}
          onGuess={handleGuess}
          onShowHint={handleShowHint}
          hintsUsed={hintsUsed}
          showHint={showHint}
          correctWrongPosition={correctWrongPosition}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
