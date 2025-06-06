"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { fetchWordData } from "@/lib/dictionary-api";

export function WordLookupDemo() {
  const [word, setWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!word.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchWordData(word.trim());
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Failed to fetch word data");
      }
    } catch (err) {
      setError("An error occurred while fetching word data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Try Smart Word Lookup
        </CardTitle>
        <CardDescription>
          Enter any word to get its definition, synonyms, antonyms, and
          examples.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Try 'serendipity' or 'ubiquitous'"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLookup()}
            disabled={isLoading}
          />
          <Button
            onClick={handleLookup}
            disabled={isLoading || !word.trim()}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading
              </>
            ) : (
              "Look Up"
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg capitalize">
                {result.term}
              </h3>
              <p className="text-muted-foreground mt-1">{result.definition}</p>
            </div>

            {result.synonyms.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Synonyms:</h4>
                <div className="flex flex-wrap gap-1">
                  {result.synonyms.map((synonym: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {synonym}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.antonyms.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Antonyms:</h4>
                <div className="flex flex-wrap gap-1">
                  {result.antonyms.map((antonym: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {antonym}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.examples.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Examples:</h4>
                <ul className="space-y-1">
                  {result.examples.map((example: string, index: number) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground italic"
                    >
                      "{example}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
