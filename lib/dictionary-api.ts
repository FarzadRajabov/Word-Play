export interface WordData {
  term: string
  definition: string
  synonyms: string[]
  antonyms: string[]
  examples: string[]
}

export interface APIResponse {
  success: boolean
  data?: WordData
  error?: string
}

// Free Dictionary API
async function fetchFromFreeDictionary(word: string): Promise<Partial<WordData>> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)

    if (!response.ok) {
      throw new Error("Word not found")
    }

    const data = await response.json()
    const entry = data[0]

    // Extract definition
    const definition = entry.meanings?.[0]?.definitions?.[0]?.definition || ""

    // Extract examples
    const examples: string[] = []
    entry.meanings?.forEach((meaning: any) => {
      meaning.definitions?.forEach((def: any) => {
        if (def.example) {
          examples.push(def.example)
        }
      })
    })

    return {
      definition,
      examples: examples.slice(0, 3), // Limit to 3 examples
    }
  } catch (error) {
    console.error("Free Dictionary API error:", error)
    return {}
  }
}

// Datamuse API for synonyms and antonyms
async function fetchFromDatamuse(word: string): Promise<Partial<WordData>> {
  try {
    const [synonymsResponse, antonymsResponse] = await Promise.all([
      fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=10`),
      fetch(`https://api.datamuse.com/words?rel_ant=${word}&max=10`),
    ])

    const synonymsData = synonymsResponse.ok ? await synonymsResponse.json() : []
    const antonymsData = antonymsResponse.ok ? await antonymsResponse.json() : []

    const synonyms = synonymsData.map((item: any) => item.word).slice(0, 5)
    const antonyms = antonymsData.map((item: any) => item.word).slice(0, 5)

    return {
      synonyms,
      antonyms,
    }
  } catch (error) {
    console.error("Datamuse API error:", error)
    return { synonyms: [], antonyms: [] }
  }
}

// WordsAPI as backup (requires RapidAPI key)
async function fetchFromWordsAPI(word: string): Promise<Partial<WordData>> {
  try {
    // This would require a RapidAPI key
    // For now, we'll return empty data as this is a backup option
    return {}
  } catch (error) {
    console.error("WordsAPI error:", error)
    return {}
  }
}

// Main function to fetch word data from multiple sources
export async function fetchWordData(word: string): Promise<APIResponse> {
  try {
    const cleanWord = word.toLowerCase().trim()

    if (!cleanWord) {
      return { success: false, error: "Please enter a valid word" }
    }

    // Fetch from multiple APIs concurrently
    const [dictionaryData, datamuseData] = await Promise.all([
      fetchFromFreeDictionary(cleanWord),
      fetchFromDatamuse(cleanWord),
    ])

    // Combine data from different sources
    const combinedData: WordData = {
      term: cleanWord,
      definition: dictionaryData.definition || "",
      synonyms: datamuseData.synonyms || [],
      antonyms: datamuseData.antonyms || [],
      examples: dictionaryData.examples || [],
    }

    // Check if we got at least a definition
    if (!combinedData.definition) {
      return {
        success: false,
        error: "Could not find definition for this word. Please check spelling or try a different word.",
      }
    }

    return { success: true, data: combinedData }
  } catch (error) {
    console.error("Error fetching word data:", error)
    return {
      success: false,
      error: "Failed to fetch word data. Please check your internet connection and try again.",
    }
  }
}

// Function to validate and clean word input
export function validateWord(word: string): { isValid: boolean; error?: string } {
  const cleanWord = word.trim()

  if (!cleanWord) {
    return { isValid: false, error: "Please enter a word" }
  }

  if (cleanWord.length < 2) {
    return { isValid: false, error: "Word must be at least 2 characters long" }
  }

  if (cleanWord.length > 50) {
    return { isValid: false, error: "Word must be less than 50 characters long" }
  }

  // Check if word contains only letters, hyphens, and apostrophes
  const wordPattern = /^[a-zA-Z\-']+$/
  if (!wordPattern.test(cleanWord)) {
    return { isValid: false, error: "Word can only contain letters, hyphens, and apostrophes" }
  }

  return { isValid: true }
}
