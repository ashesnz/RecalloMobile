# Debugging Results Screen Issue - Summary

## Problem Description
The Results Screen was showing "N/A - Question not answered" for questions that were actually answered by the user. The feedback and grades from the LLM evaluation were not being displayed correctly.

## Root Cause
The issue was caused by a **closure problem** in the `QuestionSwiper` component. The `onViewableItemsChanged` callback was created with `useRef(...).current`, which captured the initial empty state of the `evaluations` Map and never saw updates when new evaluations were added.

## Changes Made

### 1. QuestionSwiper Component (`components/question-swiper.tsx`)

#### Fixed the Closure Issue
- **Added refs** to track the latest state of `evaluations`, `responses`, and `notSureQuestions`
- **Converted `onViewableItemsChanged`** from a `useRef` to a `useCallback` that uses these refs
- **Added useEffect hooks** to keep the refs synchronized with the state
- This ensures that when the completion marker is reached, the callback has access to the latest evaluations

#### Added Comprehensive Debug Logging
- Log when evaluations are received from the API
- Log when evaluations are stored in the Map
- Log the Map size and contents when reaching completion
- Log when "Not Sure" is selected

#### Fixed Bugs
- Removed incorrect `correctAnswer: currentQuestion.text` in `handleNotSure` (was setting the question as the answer)
- Added proper state update for `canSwipe` when evaluations change

#### Added Auto-Update for Swipe State
- Added useEffect to automatically enable swiping when an evaluation or "Not Sure" is registered
- This ensures the UI is always in sync with the data state

### 2. Home Screen (`app/(tabs)/index.tsx`)

#### Enhanced Debug Logging
- Log all evaluation Map keys and values when questions complete
- Log each result as it's created
- Log the final results array in JSON format
- This will help identify if evaluations are missing or malformed

### 3. Results Screen (`app/screens/results/ResultsScreen.tsx`)
- No changes needed - the component was already correctly handling the data

## Testing Instructions

### 1. Run the App and Enable Logging
```bash
npx expo start
```

Watch the console/logs carefully during testing.

### 2. Test Scenario 1: Answer All Questions
1. Start a new session
2. Record answers for all questions
3. Wait for each evaluation to complete (you should see "Evaluating your answer..." message)
4. Swipe to the next question after each evaluation
5. Complete all questions
6. Check the Results Screen

**Expected Output:**
- All questions should show proper grades (A, B, C, D, or F)
- All questions should show scores (0-100%)
- Feedback should be from the LLM, not "N/A - Question not answered"

**Console Logs to Check:**
```
[QuestionSwiper] Evaluation received from API: { grade: 'A', score: 95, feedback: '...' }
[QuestionSwiper] Storing full evaluation: { questionId: '...', transcript: '...', grade: 'A', ... }
[QuestionSwiper] Updated evaluations Map size: 1
[QuestionSwiper] Reached completion marker
[QuestionSwiper] Evaluations Map size: 3 (should match number of questions)
[HomeScreen] Evaluations received: 3
[HomeScreen] Evaluation Map contents: (should show all evaluations)
```

### 3. Test Scenario 2: Mixed Answers and "Not Sure"
1. Start a new session
2. Answer the first question
3. Click "Not Sure" for the second question
4. Answer the third question
5. Complete the session

**Expected Output:**
- Answered questions: Show grades and feedback
- "Not Sure" question: Show "N/A" badge and "N/A - Question skipped" feedback

**Console Logs to Check:**
```
[QuestionSwiper] User marked as Not Sure: [questionId]
[QuestionSwiper] Creating N/A evaluation: { questionId: '...', feedback: 'N/A - Question skipped', ... }
```

### 4. Test Scenario 3: Skip All Questions
1. Start a new session
2. Click "Not Sure" for all questions
3. Complete the session

**Expected Output:**
- All questions should show "N/A" badge
- All feedback should say "N/A - Question skipped"

## What to Look For in Logs

### Success Indicators
✅ `[QuestionSwiper] Evaluation received from API` - Shows API is returning data
✅ `[QuestionSwiper] Storing full evaluation` - Shows data is being stored
✅ `[QuestionSwiper] Updated evaluations Map size: N` - Shows Map is growing
✅ `[QuestionSwiper] Reached completion marker` - Shows completion is triggered
✅ `[QuestionSwiper] Evaluations Map size: N` (where N = number of questions) - Shows all evaluations are present
✅ `[HomeScreen] Evaluations received: N` - Shows evaluations are passed to handler
✅ `[HomeScreen] Created result for [id]` - Shows results are being created correctly

### Failure Indicators
❌ `[QuestionSwiper] Evaluation error:` - API call failed
❌ `[QuestionSwiper] Evaluations Map size: 0` at completion - Evaluations were lost
❌ `[HomeScreen] No evaluation found for question [id]` - Evaluation missing from Map
❌ `[HomeScreen] Evaluations received: 0` - No evaluations passed to handler

## If Issues Persist

If you still see "N/A - Question not answered" for questions you've answered:

1. **Check the console logs** for the patterns above
2. **Look for evaluation errors** - The API might be failing
3. **Check question IDs** - Make sure the IDs match between DailyQuestions and evaluations
4. **Verify API response** - Make sure the backend is returning proper evaluation data

### Additional Debug Step
Add a breakpoint or console.log in `handleQuestionsComplete` to inspect the evaluations Map:

```typescript
console.log('=== DEBUGGING EVALUATIONS ===');
console.log('Daily questions:', dailyQuestions.map(q => q.id));
console.log('Evaluation keys:', Array.from(evaluations.keys()));
console.log('Do they match?', dailyQuestions.every(q => evaluations.has(q.id)));
```

## Technical Details

### The Closure Problem Explained
```typescript
// BEFORE (BROKEN):
const onViewableItemsChanged = useRef(({ viewableItems }) => {
  // This closure captures the INITIAL empty Map
  // It never sees updates to the 'evaluations' state
  onComplete(responses, evaluations); // Always passes empty Map!
}).current;

// AFTER (FIXED):
const evaluationsRef = useRef(evaluations);
useEffect(() => {
  evaluationsRef.current = evaluations; // Always keep ref updated
}, [evaluations]);

const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
  const currentEvaluations = evaluationsRef.current; // Get latest value
  onComplete(currentResponses, currentEvaluations); // Pass current Map
}, [questions, onComplete]);
```

This is a common React pitfall with callbacks that need to access the latest state but shouldn't trigger re-renders or re-subscriptions.

## Files Modified
1. `/Users/ashwin/Source/NETProjects/RecalloMobile/components/question-swiper.tsx`
2. `/Users/ashwin/Source/NETProjects/RecalloMobile/app/(tabs)/index.tsx`

## Next Steps
1. Test the app with the scenarios above
2. Review the console logs
3. If issues persist, share the console logs for further debugging

