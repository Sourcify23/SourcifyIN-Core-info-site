import React, { useState, useRef } from 'react';
import { Sparkles, Upload, X, Key, Loader2, Copy, Check } from 'lucide-react';

const SourcifyContentGenerator = () => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [eventContext, setEventContext] = useState('general');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const communityContext = `
Community Name: SourcifyIN
Email: sourcifyindia@gmail.com
Founder: Gourab Das
Established: August 2023
Type: Self-dependent student tech community based in Kolkata, India, accessible to anyone worldwide
Mission: Empower college students to reach their full potential through comprehensive support and resources
Focus: Organizing technical events, competitions, and workshops for aspiring developers
Statistics: 8K+ website views, 1.5K+ active members, 20K+ LinkedIn impressions
Contact: 91236 88767, 89677 22448, 94337 93245
Socials: https://linktr.ee/SourcifyIN
`;

  const cosmohackContext = `
Event: COSMOHACK 1 - Virtual Online Hackathon (November 2025)
Organizer: Sourcify community
Expected Participants: 500+
Expected Teams: 100+
Duration: 24 hours
Tracks: 5 different tracks
Mentors: 5+
Timeline:
- Registration: Oct 2 - Nov 2
- Approvals & Theme Release: Nov 16
- Track Specific Mentoring: Nov 17-18
- 24hr Hackathon Marathon: Nov 19-20
- Results: TBD
Purpose: Solve real-world challenges with emerging technologies, foster innovation, empower students
Past Events: EdgeX, Texplorer, TechPrimer, Nexus Quest
Sponsorship Tiers: Bronze ($40), Silver ($60), Gold ($80), Diamond ($120)
`;

  const platformSpecs = {
    whatsapp: { words: 500, tone: 'casual, friendly, emoji-friendly' },
    email: { words: 150, tone: 'professional, detailed, structured' },
    linkedin: { words: 200, tone: 'professional, engaging, hashtag-rich' },
    x: { words: 50, tone: 'concise, punchy, trending' },
    instagram: { words: 100, tone: 'visual-focused, emoji-heavy, catchy' },
    external: { words: 600, tone: 'versatile, comprehensive' }
  };

  const handleApiKeyChange = (newKey) => {
    setApiKey(newKey);
    if (newKey.trim()) {
      localStorage.setItem('gemini_api_key', newKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        setUploadedImage(event.target.result);
        await performOCR(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const performOCR = async (imageData) => {
    try {
      const img = new Image();
      img.src = imageData;
      await new Promise(resolve => img.onload = resolve);
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      setExtractedText('Image uploaded - visual context will be analyzed by Gemini');
    } catch (error) {
      console.error('OCR error:', error);
      setExtractedText('Image uploaded successfully');
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setExtractedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateContent = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your Gemini API key');
      return;
    }
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setLoading(true);
    setGeneratedContent('');

    const spec = platformSpecs[platform];
    const contextToUse = eventContext === 'cosmohack' ? cosmohackContext : '';
    
    const prompt = `You are a creative content writer for SourcifyIN community. Generate engaging content based on the following:

COMMUNITY CONTEXT:
${communityContext}

${eventContext === 'cosmohack' ? `EVENT CONTEXT:\n${contextToUse}\n` : ''}

CONTENT REQUIREMENTS:
- Topic: ${topic}
- Platform: ${platform.toUpperCase()}
- Target Word Count: EXACTLY ${spec.words} words (this is mandatory - generate content of approximately this length)
- Tone: ${spec.tone}
${extractedText ? `- Additional Context from Image: ${extractedText}\n` : ''}

INSTRUCTIONS:
1. Create compelling, attention-grabbing content optimized for ${platform}
2. IMPORTANT: The content MUST be approximately ${spec.words} words - not shorter, not much longer
3. Include relevant emojis where appropriate for the platform
4. For LinkedIn/Instagram: Include 3-5 relevant hashtags at the end
5. For X/Twitter: Make it punchy and shareable within word limit
6. For Email: Use proper structure with greeting and sign-off
7. Make it authentic to SourcifyIN's voice - inspiring, student-focused, tech-passionate
8. If about COSMOHACK, emphasize innovation, collaboration, and opportunity
9. Use call-to-action when appropriate
10. Fill the word count naturally without padding - make every word count

Generate ONLY the content, no explanations or metadata. Remember: ${spec.words} words is the target length.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: uploadedImage 
              ? [
                  { text: prompt },
                  { inline_data: { mime_type: 'image/jpeg', data: uploadedImage.split(',')[1] } }
                ]
              : [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024,
          }
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setGeneratedContent(data.candidates[0].content.parts[0].text.trim());
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate content. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SourcifyIN Content Generator
            </h1>
          </div>
          <p className="text-gray-600">AI-powered content creation for your community needs</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* API Key Section */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Key className="w-4 h-4" />
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500">Get your free API key from Google AI Studio (auto-saved locally)</p>
          </div>

          {/* Event Context */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Event Context</label>
            <select
              value={eventContext}
              onChange={(e) => setEventContext(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            >
              <option value="general">General Community Content</option>
              <option value="cosmohack">COSMOHACK 1 Hackathon</option>
            </select>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Content Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to create content about? (e.g., 'Announcing registration opening', 'Workshop highlights', 'Community achievement')"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Target Platform</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(platformSpecs).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-3 rounded-lg font-medium transition capitalize ${
                    platform === p
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Upload Reference Image (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition">
              {uploadedImage ? (
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded" className="max-h-48 mx-auto rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {extractedText && (
                    <p className="mt-3 text-sm text-gray-600 italic">{extractedText}</p>
                  )}
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Click to upload poster or reference image
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Visual context for better content generation</p>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateContent}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Content
              </>
            )}
          </button>

          {/* Generated Content */}
          {generatedContent && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Generated Content</label>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-purple-200">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{generatedContent}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Word Count:</span>
                <span>{generatedContent.trim().split(/\s+/).length} / {platformSpecs[platform].words} target words</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Made with ❤️ for SourcifyIN Community</p>
          <p className="mt-1">Powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
};

export default SourcifyContentGenerator;