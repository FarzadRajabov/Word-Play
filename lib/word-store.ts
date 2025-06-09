"use client";

import { useEffect, useState } from "react";
import words from "./words.json";
import { supabase } from "./supabase";

export interface Word {
  id: string;
  term: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  user_id?: string;
}

const sampleWords: Word[] = words as Word[];
const WORDS_VERSION = "v2";

export function useWordStore() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Listen for auth changes and load user words if signed in
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserWords(session.user.id);
      } else {
        loadLocalWords();
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserWords(session.user.id);
        } else {
          loadLocalWords();
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  // Load words from localStorage
  const loadLocalWords = () => {
    const storedVersion = localStorage.getItem("wordplay-words-version");
    const storedWords = localStorage.getItem("wordplay-words");
    if (storedWords && storedVersion === WORDS_VERSION) {
      setWords(JSON.parse(storedWords));
    } else {
      setWords(sampleWords);
      localStorage.setItem("wordplay-words", JSON.stringify(sampleWords));
      localStorage.setItem("wordplay-words-version", WORDS_VERSION);
    }
    setIsLoaded(true);
  };

  // Load words from Supabase for the user
  const loadUserWords = async (userId: string) => {
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("user_id", userId);
    let userWords = !error && data ? data : [];
    // Merge sampleWords and userWords, avoiding duplicates by term
    const merged = [...userWords];
    const userTerms = new Set(userWords.map((w) => w.term.toLowerCase()));
    for (const w of sampleWords) {
      if (!userTerms.has(w.term.toLowerCase())) {
        merged.push(w);
      }
    }
    setWords(merged);
    setIsLoaded(true);
  };

  // Save words to localStorage whenever they change (if not signed in)
  useEffect(() => {
    if (isLoaded && !user) {
      localStorage.setItem("wordplay-words", JSON.stringify(words));
    }
  }, [words, isLoaded, user]);

  // Clear localStorage words if user leaves the site (not just reload or navigate within app)
  useEffect(() => {
    if (!user) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // Only clear if the navigation is not a soft navigation (i.e., leaving the site)
        localStorage.removeItem("wordplay-words");
        localStorage.removeItem("wordplay-words-version");
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [user]);

  // Add a new word
  const addWord = async (word: Omit<Word, "id">) => {
    if (user) {
      const { data, error } = await supabase
        .from("words")
        .insert([{ ...word, user_id: user.id }])
        .select();
      if (!error && data && data.length > 0) {
        setWords([...words, { ...data[0] }]);
      }
    } else {
      const newWord = { ...word, id: Date.now().toString() };
      setWords([...words, newWord]);
    }
  };

  // Update an existing word
  const updateWord = async (id: string, updatedWord: Omit<Word, "id">) => {
    if (user) {
      const { data, error } = await supabase
        .from("words")
        .update({ ...updatedWord })
        .eq("id", id)
        .eq("user_id", user.id)
        .select();
      if (!error && data && data.length > 0) {
        setWords(words.map((word) => (word.id === id ? { ...data[0] } : word)));
      }
    } else {
      setWords(
        words.map((word) => (word.id === id ? { ...updatedWord, id } : word))
      );
    }
  };

  // Delete a word
  const deleteWord = async (id: string) => {
    if (user) {
      const { error } = await supabase
        .from("words")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (!error) {
        setWords(words.filter((word) => word.id !== id));
      }
    } else {
      setWords(words.filter((word) => word.id !== id));
    }
  };

  // Get random words for games
  const getRandomWords = (count: number) => {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, words.length));
  };

  return {
    words,
    addWord,
    updateWord,
    deleteWord,
    getRandomWords,
    isLoaded,
    user,
  };
}
