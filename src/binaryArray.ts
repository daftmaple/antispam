/**
 * TSPlayground link: https://www.typescriptlang.org/play?#code/MYewdgzgLgBBICcoEEEIIYE8YF4YAp00sAuOKBASzAHMBtAXQEozorbHcA+GAbwCgYMBAFMoAVwRgYRDJgB08JPjAiA7jACSYKABt5AYRC7d6KInxN5oALYAHIiKYBufgF9X-UJFgAjakSY2gAmIgAeAPIAZrgEsqTk7PQMADQwlFAiNqwU1DQsMGDiNr4iCNx8gjC6YjA21CHhsQAMrkI1sDboYY1hsfEKNbRQABYwALQwAIyeQmojlDUE9WC9MAA8eF09YKFhTJVCQt7QMMCSojprePj4K2sA1HXdvQcA9DAATAcAPjCtVWO4FOIhqNhEOn6xEwdHOaAhUF6DDaRxOsFsDlEsVBWQR8l0IGA6BqRnsjnwGSyLn4gPSMXwGMcG3+BwERyObw+AFEwQjmZpMjZaUJ7rsmng4ZdEWK+k8ZrS3DBQRARHSCIysTxmqzhc8dntYpKEWtJvL2Yrlaq2ezhGJJNIjVcZSihG4qm6qqIJFIJvKPDS0cJYkoUND8HQAEToCNpCMAE5jMAjAC1ExGAF6JgDkCAAlyqEAA3XNZtJZgAKonqZVLMCzBl0lGAIxLZdsNnEYEoAEdxK260Sov2s8hgpQROIs8xXCdjCJ8SAaPh-GBAr1ovgEGX0FmmNTZzUF0uV2uZRut3XfLv98C50flwEEEEz1FN2XR+PJ3uZ7fDwTj4+z57OeZaVlk44INerhAA
 */

/**
 * Sorts array for binary indexOf
 */
export const sortArray = (array: string[]): string[] => {
  return array.sort(new Intl.Collator().compare);
};

/**
 * Binary search for string array
 * Assumes that the string array is sorted by localeCompare
 */
export const binaryIndexOf = (array: string[], item: string): number => {
  let minIndex = 0;
  let maxIndex = array.length - 1;

  while (minIndex <= maxIndex) {
    const currentIndex = ((minIndex + maxIndex) / 2) | 0;
    const element = array[currentIndex];
    const compare = element.localeCompare(item);

    if (compare < 0) {
      minIndex = currentIndex + 1;
    } else if (compare > 0) {
      maxIndex = currentIndex - 1;
    } else {
      return currentIndex;
    }
  }

  return -1;
};
