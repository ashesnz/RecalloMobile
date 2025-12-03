# Backend API Requirements for Audio Processing

## Overview
The mobile app now sends audio recordings to your backend for secure processing with OpenAI's Whisper API. This keeps your API key secure and allows for centralized processing and answer evaluation.

## New API Endpoints Required

### 1. Audio Transcription Endpoint

**Endpoint:** `POST /api/audio/transcribe`

**Authentication:** Required (Bearer token)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: Audio file (m4a, wav, mp3, or webm format)

**Response:**
```json
{
  "transcript": "The user's spoken answer text"
}
```

**Implementation Notes:**
- Accept audio file upload
- Send audio to OpenAI Whisper API (`whisper-1` model)
- Your OpenAI API key should be stored securely on the backend (environment variable)
- Return the transcribed text

**Example Backend Code (C# .NET):**
```csharp
[HttpPost("transcribe")]
[Authorize]
public async Task<IActionResult> TranscribeAudio([FromForm] IFormFile file)
{
    if (file == null || file.Length == 0)
        return BadRequest(new { message = "No audio file provided" });

    // Read the file into a stream
    using var stream = file.OpenReadStream();
    
    // Call OpenAI Whisper API
    var client = new HttpClient();
    client.DefaultRequestHeaders.Authorization = 
        new AuthenticationHeaderValue("Bearer", _configuration["OpenAI:ApiKey"]);
    
    var formData = new MultipartFormDataContent();
    formData.Add(new StreamContent(stream), "file", file.FileName);
    formData.Add(new StringContent("whisper-1"), "model");
    formData.Add(new StringContent("en"), "language");
    
    var response = await client.PostAsync(
        "https://api.openai.com/v1/audio/transcriptions", 
        formData
    );
    
    if (!response.IsSuccessStatusCode)
    {
        var error = await response.Content.ReadAsStringAsync();
        return StatusCode(500, new { message = "Transcription failed", error });
    }
    
    var result = await response.Content.ReadFromJsonAsync<WhisperResponse>();
    return Ok(new { transcript = result.Text });
}
```

---

### 2. Answer Evaluation Endpoint

**Endpoint:** `POST /api/questions/evaluate`

**Authentication:** Required (Bearer token)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "questionId": "string",
  "questionText": "What is the capital of France?",
  "userAnswer": "The capital of France is Paris"
}
```

**Response:**
```json
{
  "grade": "A",
  "score": 95,
  "feedback": "Excellent! You provided a clear and accurate answer.",
  "correctAnswer": "Paris" // Optional
}
```

**Response Fields:**
- `grade`: Letter grade ('A', 'B', 'C', 'D', or 'F')
- `score`: Numeric score (0-100)
- `feedback`: Detailed feedback text explaining the grade
- `correctAnswer`: (Optional) The expected correct answer for reference

**Implementation Notes:**
- Retrieve the correct answer for the question from your database
- Compare the user's answer with the correct answer
- You can use AI (GPT-4, GPT-3.5) to intelligently grade answers that are semantically correct even if not word-for-word
- Return a grade, score, and constructive feedback

**Example Backend Code (C# .NET):**
```csharp
[HttpPost("evaluate")]
[Authorize]
public async Task<IActionResult> EvaluateAnswer([FromBody] EvaluateAnswerDto dto)
{
    // Get the question from database
    var question = await _context.Questions
        .FirstOrDefaultAsync(q => q.Id == dto.QuestionId);
    
    if (question == null)
        return NotFound(new { message = "Question not found" });
    
    // Use OpenAI to evaluate the answer
    var evaluation = await _aiService.EvaluateAnswer(
        question.Text,
        question.ExpectedAnswer,
        dto.UserAnswer
    );
    
    return Ok(new 
    {
        grade = evaluation.Grade,
        score = evaluation.Score,
        feedback = evaluation.Feedback,
        correctAnswer = question.ExpectedAnswer
    });
}
```

**Example AI Evaluation Prompt:**
```
You are evaluating a student's answer to a question.

Question: {questionText}
Expected Answer: {correctAnswer}
Student's Answer: {userAnswer}

Evaluate the student's answer and provide:
1. A letter grade (A, B, C, D, or F)
2. A numeric score (0-100)
3. Constructive feedback (2-3 sentences)

Grade based on:
- Accuracy: Does the answer match the expected content?
- Completeness: Are all key points covered?
- Clarity: Is the answer clear and well-expressed?

Return JSON format:
{
  "grade": "A",
  "score": 95,
  "feedback": "Your feedback here"
}
```

---

## Security Considerations

1. **API Key Storage**: Store your OpenAI API key in environment variables or secure key vault, never in code
2. **Authentication**: Both endpoints require user authentication
3. **Rate Limiting**: Consider rate limiting these endpoints as they make external API calls
4. **File Size Limits**: Limit audio file uploads to reasonable sizes (e.g., 10MB max)
5. **File Type Validation**: Validate that uploaded files are actually audio files

---

## Mobile App Flow

The mobile app now follows this flow:

1. **User holds mic button** → Recording starts
2. **User releases mic button** → Recording stops
3. **Audio is uploaded** to `/api/audio/transcribe`
4. **Backend transcribes** audio using Whisper API
5. **Transcript is returned** to app
6. **App immediately sends** transcript to `/api/questions/evaluate`
7. **Backend evaluates** the answer (using AI or simple comparison)
8. **Feedback is displayed** to the user with grade, score, and comments

---

## Testing the Endpoints

You can test the endpoints using curl or Postman:

### Test Transcription:
```bash
curl -X POST http://localhost:5298/api/audio/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@recording.m4a"
```

### Test Evaluation:
```bash
curl -X POST http://localhost:5298/api/questions/evaluate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "123",
    "questionText": "What is the capital of France?",
    "userAnswer": "Paris"
  }'
```

---

## Environment Variables

Add to your backend's configuration:

```bash
OpenAI__ApiKey=sk-your-openai-api-key-here
```

Or in appsettings.json:
```json
{
  "OpenAI": {
    "ApiKey": "sk-your-openai-api-key-here"
  }
}
```

---

## Benefits of This Approach

✅ **Security**: API key never exposed to mobile app
✅ **Centralized**: All AI processing in one place
✅ **Flexible**: Easy to change AI models or logic
✅ **Scalable**: Can add caching, queue processing, etc.
✅ **Trackable**: Log all evaluations for analytics
✅ **Consistent**: Same evaluation logic for all users

