/**
 * The getting-started questionnaire (Challenge 03). Plain-language
 * questions a business owner can answer without a tax dictionary; each
 * one explains why it's being asked.
 */

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  prompt: string;
  /** Why we're asking — trust comes from explaining. */
  why: string;
  options: readonly QuestionOption[];
}

export const DAVE_QUESTIONS: readonly Question[] = [
  {
    id: "q-entity",
    prompt: "How is Peterson Coffee set up?",
    why: "This decides which tax form your business files.",
    options: [
      { value: "s-corp", label: "S corporation" },
      { value: "llc", label: "LLC" },
      { value: "sole", label: "Sole proprietor" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    id: "q-employees",
    prompt: "Did you have employees on payroll in 2025?",
    why: "Payroll changes which forms we need from you.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No, just me" },
      { value: "contractors", label: "Only contractors (1099s)" },
    ],
  },
  {
    id: "q-locations",
    prompt: "How many locations did you operate?",
    why: "Multiple locations can mean filing in more than one state.",
    options: [
      { value: "1", label: "One" },
      { value: "2-3", label: "Two or three" },
      { value: "4+", label: "Four or more" },
    ],
  },
  {
    id: "q-equipment",
    prompt: "Did you buy any major equipment this year?",
    why: "Big purchases like espresso machines can often be written off.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "I'd have to check" },
    ],
  },
  {
    id: "q-home-office",
    prompt: "Do you do business work from home?",
    why: "You may be able to deduct part of your home costs.",
    options: [
      { value: "yes", label: "Yes, regularly" },
      { value: "sometimes", label: "Occasionally" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "q-vehicle",
    prompt: "Did you use a vehicle for the business?",
    why: "Business mileage is deductible when we have the records.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
] as const;
