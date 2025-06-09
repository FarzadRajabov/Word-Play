"use client";
import {
  getCurrentUserId,
  incrementUserPoints,
  ensureUserProfile,
} from "@/lib/points";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useWordStore, type Word } from "@/lib/word-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function FillBlank() {
  const { getRandomWords, words, isLoaded } = useWordStore();
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [options, setOptions] = useState<
    { term: string; isCorrect: boolean }[]
  >([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentSentence, setCurrentSentence] = useState("");

  const GAME_SIZE = 5;
  const OPTIONS_COUNT = 4;

  useEffect(() => {
    if (isLoaded && words.length >= OPTIONS_COUNT) {
      const wordsWithExamples = words.filter(
        (word) => word.examples.length > 0
      );
      if (wordsWithExamples.length >= GAME_SIZE) {
        startGame(wordsWithExamples);
      }
    }
  }, [isLoaded]);

  const startGame = (wordsWithExamples: Word[]) => {
    const selectedWords = wordsWithExamples
      .sort(() => 0.5 - Math.random())
      .slice(0, GAME_SIZE);

    setGameWords(selectedWords);
    setCurrentWordIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setGameOver(false);
    generateQuestion(selectedWords, 0);
  };

  const generateQuestion = (gameWords: Word[], index: number) => {
    const currentWord = gameWords[index];

    // Get a random example sentence
    const exampleSentence =
      currentWord.examples[
        Math.floor(Math.random() * currentWord.examples.length)
      ];

    // Replace the word with a blank
    const blankSentence = exampleSentence.replace(
      new RegExp(`\\b${currentWord.term}\\b`, "i"),
      "________"
    );

    setCurrentSentence(blankSentence);

    // Set up options
    const correctOption = { term: currentWord.term, isCorrect: true };

    // Get other random words for incorrect options
    const otherWords = words
      .filter((w) => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, OPTIONS_COUNT - 1)
      .map((w) => ({ term: w.term, isCorrect: false }));

    // Combine and shuffle options
    const allOptions = [correctOption, ...otherWords].sort(
      () => 0.5 - Math.random()
    );
    setOptions(allOptions);
  };

  const handleOptionSelect = async (index: number) => {
    if (showFeedback) return;

    setSelectedOption(index);
    setShowFeedback(true);

    if (options[index].isCorrect) {
      setScore(score + 1);
      const userId = await getCurrentUserId();
      if (userId) {
        await ensureUserProfile(userId);
        await incrementUserPoints(userId);
      }
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);

      if (currentWordIndex < gameWords.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        generateQuestion(gameWords, currentWordIndex + 1);
      } else {
        setGameOver(true);
      }
    }, 1500);
  };

  if (!isLoaded) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  const wordsWithExamples = words.filter((word) => word.examples.length > 0);

  if (wordsWithExamples.length < GAME_SIZE) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Link>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Not Enough Words with Examples</CardTitle>
            <CardDescription>
              You need at least {GAME_SIZE} words with example sentences to play
              Fill in the Blank.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/words/manage" className="w-full">
              <Button className="w-full">Add More Words</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Link>
        <Badge variant="outline" className="text-sm">
          Score: {score}/{GAME_SIZE}
        </Badge>
      </div>

      {!gameOver ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Fill in the Blank</CardTitle>
            <CardDescription className="text-center">
              Choose the word that best completes the sentence
            </CardDescription>
            <Progress
              value={(currentWordIndex / GAME_SIZE) * 100}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <p className="text-xl">{currentSentence}</p>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    selectedOption === index
                      ? option.isCorrect
                        ? "default"
                        : "destructive"
                      : "outline"
                  }
                  className={`w-full justify-start p-4 h-auto text-left ${
                    showFeedback && option.isCorrect
                      ? "ring-2 ring-green-500"
                      : ""
                  }`}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showFeedback}
                >
                  <div className="flex items-center w-full">
                    <span className="flex-1">{option.term}</span>
                    {showFeedback &&
                      selectedOption === index &&
                      (option.isCorrect ? (
                        <Check className="h-5 w-5 ml-2 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 ml-2" />
                      ))}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Game Over!</CardTitle>
            <CardDescription className="text-center">
              You scored {score} out of {GAME_SIZE}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {score === GAME_SIZE ? (
              <p className="text-lg font-medium text-green-500">
                Perfect score! Amazing job!
              </p>
            ) : score >= GAME_SIZE / 2 ? (
              <p className="text-lg font-medium">
                Good job! Keep practicing to improve.
              </p>
            ) : (
              <p className="text-lg font-medium">
                Keep practicing to learn these words better.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/">Back to Games</Link>
            </Button>
            <Button onClick={() => startGame(wordsWithExamples)}>
              Play Again
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
