
import React, { useState } from 'react';
import AuthorityMap from './components/AuthorityMap';
import { AppStage, State, ViewMode, Pillar, LessonVariation } from './types';
import { generateCoachResponse, generatePillars, generateLessonVariations, generateAudienceQuestions } from './services/gemini';
import { Send, Languages } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<State>({
    apiKey: process.env.API_KEY || '',
    topic: null,
    currentStage: AppStage.ORIENTATION,
    currentView: 'HOME',
    messages: [
      {
        id: '1',
        role: 'model',
        text: "Welcome to the Iterative Topical Authority Coach. \n\nI am here to help you build a complete, demand-driven content strategy from a single core topic.\n\nTo begin, please enter the MAIN TOPIC you want to build authority around.",
        timestamp: Date.now()
      }
    ],
    pillars: [],
    variations: [],
    questions: [],
    selectedPillar: null,
    selectedVariation: null,
    isLoading: false,
    language: 'en'
  });

  const [input, setInput] = useState('');

  const addMessage = (role: 'user' | 'model', text: string) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { id: Date.now().toString(), role, text, timestamp: Date.now() }]
    }));
  };

  const handleSendMessage = async (text: string) => {
    addMessage('user', text);
    setState(prev => ({ ...prev, isLoading: true }));

    let newState = { ...state };
    
    // Topic Capture Logic
    if (!state.topic && state.currentStage === AppStage.ORIENTATION) {
        newState.topic = text;
        setState(prev => ({ ...prev, topic: text }));
    }

    // Context for AI Mentor
    let context = `Current Stage: ${state.currentStage}.`;
    if (newState.topic) context += ` Topic: "${newState.topic}".`;
    if (state.pillars.length > 0) context += ` Pillars: ${state.pillars.length} generated.`;
    if (state.selectedPillar) context += ` Selected Pillar: "${state.selectedPillar.title}".`;
    if (state.variations.length > 0) context += ` Variations: ${state.variations.length} generated.`;
    if (state.selectedVariation) context += ` Selected Variation: "${state.selectedVariation.title}".`;

    const responseText = await generateCoachResponse(
        state.apiKey!, 
        [...state.messages, {role: 'user', text}], 
        context, 
        state.language,
        newState.topic
    );
    
    addMessage('model', responseText);
    setState(prev => ({ ...prev, isLoading: false }));
    
    // Auto-trigger: Generate 30 Pillars if topic is just set and user confirms
    if (state.topic && state.currentStage === AppStage.ORIENTATION && 
       (text.toLowerCase().includes('yes') || text.includes('네') || text.toLowerCase().includes('start') || text.includes('시작') || text.toLowerCase().includes('generate') || text.toLowerCase().includes('go'))) {
        handleGeneratePillars(state.topic);
    } 
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || state.isLoading) return;
    handleSendMessage(input);
    setInput('');
  };

  const handleNavigate = (view: ViewMode) => {
      setState(prev => ({ ...prev, currentView: view }));
  };

  const handleLanguageChange = () => {
    const newLang = state.language === 'en' ? 'ko' : 'en';
    setState(prev => ({ ...prev, language: newLang }));
  };

  // Download Handler
  const handleDownload = () => {
    const { topic, selectedPillar, selectedVariation, variations, questions, language } = state;
    const isKo = language === 'ko';
    
    // Simple helper to avoid null text
    const safeText = (text: string | null | undefined) => text || '';

    // Build markdown content
    let md = `# ${isKo ? '토픽 권위 전략' : 'Topical Authority Strategy'}: ${safeText(topic)}\n\n`;

    if (selectedPillar) {
        md += `## ${isKo ? '선택된 기둥 (Subtopic)' : 'Selected Pillar'}: ${selectedPillar.title}\n`;
        md += `> ${selectedPillar.description}\n`;
        md += `**${isKo ? '카테고리' : 'Category'}:** ${selectedPillar.category}\n\n`;
    }

    if (variations.length > 0) {
        md += `### ${isKo ? '레슨 변형 (Variations)' : 'Lesson Variations'}\n`;
        variations.forEach(v => {
             const isSelected = selectedVariation?.id === v.id;
             const prefix = isSelected ? '✅ **SELECTED**:' : '-';
             md += `${prefix} **${v.title}**\n  *${v.angle}* - ${v.description}\n\n`;
        });
    }

    if (selectedVariation && questions.length > 0) {
         md += `### ${isKo ? '청중 질문 (Related Questions)' : 'Audience Questions'} for: ${selectedVariation.title}\n`;
         questions.forEach((q, i) => {
             md += `${i+1}. ${q.question}\n   *Intent: ${q.intent}*\n`;
         });
    }
    
    // Create download link
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeText(topic).replace(/\s+/g, '_')}_Strategy.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Step 1: Generate 30 Pillars
  const handleGeneratePillars = async (topic: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const pillars = await generatePillars(state.apiKey!, state.language, topic);
    setState(prev => ({
        ...prev,
        pillars,
        currentStage: AppStage.PILLARS,
        currentView: 'PILLARS',
        isLoading: false,
        messages: [...prev.messages, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: state.language === 'ko' 
              ? `"${topic}"에 대한 30개의 핵심 기둥을 생성했습니다. '기둥' 탭으로 이동하여 하나를 선택하세요.` 
              : `I've generated 30 foundational pillars for "${topic}". Please go to the 'Pillars' tab and select ONE to proceed to the next step.`, 
            timestamp: Date.now() 
        }]
    }));
  };

  // Step 2: Generate 10 Variations
  const handleSelectPillar = async (pillar: Pillar) => {
      setState(prev => ({ 
          ...prev, 
          selectedPillar: pillar, 
          isLoading: true,
          currentView: 'HOME' // Briefly show chat while loading
      }));
      
      addMessage('user', `I select the pillar: "${pillar.title}".`);
      addMessage('model', state.language === 'ko' ? '좋습니다. 해당 기둥에 대한 10가지 구체적인 레슨 변형을 생성하고 있습니다...' : 'Excellent choice. I am now generating 10 specific lesson variations for that pillar...');

      const variations = await generateLessonVariations(state.apiKey!, state.language, state.topic!, pillar);

      setState(prev => ({
          ...prev,
          variations,
          currentStage: AppStage.VARIATIONS,
          currentView: 'VARIATIONS',
          isLoading: false,
          messages: [...prev.messages, {
              id: Date.now().toString(),
              role: 'model',
              text: state.language === 'ko'
                ? `10가지 레슨 변형이 준비되었습니다. '변형' 탭에서 하나를 선택하여 청중 질문을 생성하세요.`
                : `I've crafted 10 specific lesson variations for "${pillar.title}". Please view them in the 'Variations' tab and select ONE to uncover audience questions.`,
              timestamp: Date.now()
          }]
      }));
  };

  // Step 3: Generate 25 Questions
  const handleSelectVariation = async (variation: LessonVariation) => {
      setState(prev => ({ 
          ...prev, 
          selectedVariation: variation, 
          isLoading: true,
          currentView: 'HOME'
      }));

      addMessage('user', `I select the variation: "${variation.title}".`);
      addMessage('model', state.language === 'ko' ? '완벽합니다. 이제 실제 청중이 검색할 만한 질문들을 도출해 보겠습니다...' : 'Perfect. Now digging into the search intent to find the burning questions for this specific lesson...');

      const questions = await generateAudienceQuestions(state.apiKey!, state.language, state.topic!, state.selectedPillar!, variation);

      setState(prev => ({
          ...prev,
          questions,
          currentStage: AppStage.QUESTIONS,
          currentView: 'QUESTIONS',
          isLoading: false,
          messages: [...prev.messages, {
              id: Date.now().toString(),
              role: 'model',
              text: state.language === 'ko'
                ? `25개의 핵심 청중 질문이 생성되었습니다. '질문' 탭에서 확인하세요. 이것이 당신의 콘텐츠 로드맵입니다.`
                : `I've identified 25 high-intent audience questions. Check the 'Questions' tab. This is your demand-driven content roadmap.`,
              timestamp: Date.now()
          }]
      }));
  };
  
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden font-sans text-ink bg-paper">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <AuthorityMap 
              currentView={state.currentView}
              stage={state.currentStage}
              pillars={state.pillars}
              variations={state.variations}
              questions={state.questions}
              selectedPillar={state.selectedPillar}
              selectedVariation={state.selectedVariation}
              onNavigate={handleNavigate}
              onSelectPillar={handleSelectPillar}
              onSelectVariation={handleSelectVariation}
              onDownload={handleDownload}
              isLoading={state.isLoading}
              language={state.language}
              messages={state.messages}
          />
      </div>

      {/* Bottom Input Bar */}
      <div className="h-auto w-full bg-white/80 backdrop-blur-md border-t border-wash-blue p-4 shadow-lg z-30">
        <form onSubmit={handleFormSubmit} className="max-w-5xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={handleLanguageChange}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-paper text-watercolor-indigo font-bold text-sm hover:bg-wash-blue border border-wash-blue transition-colors shadow-sm"
              title="Toggle Language"
            >
              <Languages size={18} />
              {state.language === 'en' ? 'EN' : 'KO'}
            </button>
            
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={state.language === 'ko' ? "답변을 입력하세요..." : "Reply to your mentor..."}
                    className="w-full pl-5 pr-12 py-3 bg-white border border-wash-blue/50 rounded-full focus:outline-none focus:ring-2 focus:ring-watercolor-indigo/30 focus:border-watercolor-indigo/50 text-ink placeholder-ink-light/50 text-base font-sans transition-all shadow-inner"
                    disabled={state.isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || state.isLoading}
                    className="absolute right-2 top-2 p-1.5 bg-watercolor-indigo text-white rounded-full hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                    <Send size={18} />
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default App;
