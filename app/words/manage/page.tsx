"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useWordStore, type Word } from "@/lib/word-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Plus, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { fetchWordData, validateWord } from "@/lib/dictionary-api";

export default function ManageWords() {
  const { words, addWord, updateWord, deleteWord, isLoaded } = useWordStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const [formData, setFormData] = useState<Omit<Word, "id">>({
    term: "",
    definition: "",
    synonyms: [],
    antonyms: [],
    examples: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [wordInput, setWordInput] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);

  const resetForm = () => {
    setFormData({
      term: "",
      definition: "",
      synonyms: [],
      antonyms: [],
      examples: [],
    });
  };

  const handleWordLookup = async () => {
    const validation = validateWord(wordInput);
    if (!validation.isValid) {
      setApiError(validation.error || "Invalid word");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    const result = await fetchWordData(wordInput);

    if (result.success && result.data) {
      setFormData({
        term: result.data.term,
        definition: result.data.definition,
        synonyms: result.data.synonyms,
        antonyms: result.data.antonyms,
        examples: result.data.examples,
      });
      setIsAdding(true);
      setWordInput("");
    } else {
      setApiError(result.error || "Failed to fetch word data");
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateWord(editingId, formData);
      setEditingId(null);
    } else {
      addWord(formData);
    }

    resetForm();
    setIsAdding(false);
  };

  const handleEdit = (word: Word) => {
    setFormData({
      term: word.term,
      definition: word.definition,
      synonyms: word.synonyms,
      antonyms: word.antonyms,
      examples: word.examples,
    });
    setEditingId(word.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    resetForm();
    setEditingId(null);
    setIsAdding(false);
    setShowManualForm(false);
    setApiError(null);
    setWordInput("");
  };

  if (!isLoaded) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Manage Vocabulary</h1>
      </div>

      {!isAdding ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Words</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowManualForm(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Manually</span>
              </Button>
            </div>
          </div>

          {/* Quick Add Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Add Word</CardTitle>
              <CardDescription>
                Enter a word and we'll automatically fetch its definition,
                synonyms, antonyms, and examples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a word (e.g., 'serendipity')"
                  value={wordInput}
                  onChange={(e) => {
                    setWordInput(e.target.value);
                    setApiError(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleWordLookup();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleWordLookup}
                  disabled={isLoading || !wordInput.trim()}
                  className="min-w-[100px]"
                >
                  {isLoading ? "Loading..." : "Look Up"}
                </Button>
              </div>
              {apiError && (
                <p className="text-sm text-destructive mt-2">{apiError}</p>
              )}
            </CardContent>
          </Card>

          {/* Existing words table with pagination */}
          {words.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Definition
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Synonyms
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {words.slice(0, visibleCount).map((word) => (
                      <TableRow key={word.id}>
                        <TableCell className="font-medium">
                          {word.term}
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                          {word.definition}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {word.synonyms.join(", ")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(word)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteWord(word.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {visibleCount < words.length && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((c) => c + 20)}
                  >
                    Show More
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  No words added yet. Add your first word to start learning!
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Word" : "Review & Add Word"}
            </CardTitle>
            <CardDescription>
              {editingId
                ? "Update the details for this vocabulary word"
                : "Review the automatically fetched data and make any necessary edits before adding"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="term">Word/Term</Label>
                <Input
                  id="term"
                  value={formData.term}
                  onChange={(e) =>
                    setFormData({ ...formData, term: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="definition">Definition</Label>
                <Textarea
                  id="definition"
                  value={formData.definition}
                  onChange={(e) =>
                    setFormData({ ...formData, definition: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="synonyms">Synonyms (comma separated)</Label>
                <Input
                  id="synonyms"
                  value={formData.synonyms.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      synonyms: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="antonyms">Antonyms (comma separated)</Label>
                <Input
                  id="antonyms"
                  value={formData.antonyms.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      antonyms: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="examples">
                  Example Sentences (one per line)
                </Label>
                <Textarea
                  id="examples"
                  value={formData.examples.join("\n")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      examples: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update Word" : "Add Word"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Manual Add Form Modal */}
      {showManualForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add Word Manually</CardTitle>
            <CardDescription>
              Add a word with custom definitions and examples
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-term">Word/Term</Label>
                <Input
                  id="manual-term"
                  value={formData.term}
                  onChange={(e) =>
                    setFormData({ ...formData, term: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-definition">Definition</Label>
                <Textarea
                  id="manual-definition"
                  value={formData.definition}
                  onChange={(e) =>
                    setFormData({ ...formData, definition: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-synonyms">
                  Synonyms (comma separated)
                </Label>
                <Input
                  id="manual-synonyms"
                  value={formData.synonyms.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      synonyms: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-antonyms">
                  Antonyms (comma separated)
                </Label>
                <Input
                  id="manual-antonyms"
                  value={formData.antonyms.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      antonyms: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-examples">
                  Example Sentences (one per line)
                </Label>
                <Textarea
                  id="manual-examples"
                  value={formData.examples.join("\n")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      examples: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManualForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Word</Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
