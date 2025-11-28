
import React, { useState } from 'react';
import { AppStage, Pillar, LessonVariation, AudienceQuestion, Language, ViewMode, Message } from '../types';
import { BookOpen, Layers, HelpCircle, Loader2, Home, ArrowDownAZ, ArrowRight, CheckCircle2, Download } from 'lucide-react';
import ChatInterface from './ChatInterface';

interface AuthorityMapProps {
  currentView: ViewMode;
  stage: AppStage;
  pillars: Pillar[];
  variations: LessonVariation[];
  questions: AudienceQuestion[];
  selectedPillar: Pillar | null;
  selectedVariation: LessonVariation | null;
  
  onNavigate: (view: ViewMode) => void;
  onSelectPillar: (pillar: Pillar) => void;
  onSelectVariation: (variation: LessonVariation) => void;
  onDownload: () => void;
  
  isLoading: boolean;
  language: Language;
  messages: Message[];
}

const AuthorityMap: React.FC<AuthorityMapProps> = ({
  currentView,
  stage,
  pillars,
  variations,
  questions,
  selectedPillar,
  selectedVariation,
  onNavigate,
  onSelectPillar,
  onSelectVariation,
  onDownload,
  isLoading,
  language,
  messages,
}) => {
  const [sortMethod, setSortMethod] = useState<'title' | 'category'>('category');

  const labels = {
    home: language === 'ko' ? '홈 (채팅)' : 'Home',
    pillars: language === 'ko' ? '30개 기둥' : '30 Pillars',
    variations: language === 'ko' ? '10개 변형' : '10 Variations',
    questions: language === 'ko' ? '25개 질문' : '25 Questions',
    
    pillarsTitle: language === 'ko' ? '30개의 광범위한 기둥' : '30 Broad Pillars',
    variationsTitle: language === 'ko' ? '10개의 구체적 레슨' : '10 Lesson Variations',
    questionsTitle: language === 'ko' ? '25개의 청중 질문' : '25 Audience Questions',

    pillarPrompt: language === 'ko' ? '이 기둥을 선택하여 레슨 생성하기' : 'Select to generate Lesson Variations',
    variationPrompt: language === 'ko' ? '이 레슨을 선택하여 질문 생성하기' : 'Select to generate Audience Questions',
    
    sortBy: language === 'ko' ? '정렬:' : 'Sort by:',
    sortTitle: language === 'ko' ? '제목' : 'Title',
    sortCategory: language === 'ko' ? '카테고리' : 'Category',
    
    contextPillar: language === 'ko' ? '선택된 기둥:' : 'Selected Pillar:',
    contextVariation: language === 'ko' ? '선택된 레슨:' : 'Selected Lesson:',
    
    download: language === 'ko' ? '전략 다운로드' : 'Download Strategy',
  };

  const navItems = [
    { label: labels.home, icon: Home, view: 'HOME' as ViewMode, disabled: false },
    { label: labels.pillars, icon: BookOpen, view: 'PILLARS' as ViewMode, disabled: pillars.length === 0 },
    { label: labels.variations, icon: Layers, view: 'VARIATIONS' as ViewMode, disabled: variations.length === 0 },
    { label: labels.questions, icon: HelpCircle, view: 'QUESTIONS' as ViewMode, disabled: questions.length === 0 },
  ];

  const renderNav = () => (
    <div className="flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-wash-blue px-6 py-4 shadow-sm shrink-0 z-20">
       <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
              <button
                key={item.label}
                onClick={() => !item.disabled && onNavigate(item.view)}
                disabled={item.disabled}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shrink-0
                  ${isActive 
                      ? 'bg-gradient-to-r from-watercolor-blue/10 to-watercolor-indigo/10 text-watercolor-indigo shadow-inner ring-1 ring-watercolor-indigo/20' 
                      : 'text-ink-light hover:bg-white hover:text-watercolor-teal hover:shadow-sm'}
                  ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <item.icon size={16} />
                {item.label}
              </button>
          )})}
       </div>
       
       <button
        onClick={onDownload}
        disabled={isLoading || !selectedPillar}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-watercolor-indigo/10 text-watercolor-indigo text-sm font-bold hover:bg-watercolor-indigo hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed ml-4 shrink-0"
        title={labels.download}
       >
         <Download size={16} />
         <span className="hidden md:inline">{labels.download}</span>
       </button>
    </div>
 );

  const renderHome = () => (
    <div className="h-full">
        <ChatInterface 
            messages={messages} 
            isLoading={isLoading} 
            language={language} 
        />
    </div>
  );

  const renderPillars = () => {
    const sortedPillars = [...pillars].sort((a, b) => {
        if (sortMethod === 'title') {
            return a.title.localeCompare(b.title);
        } else {
            const categoryCompare = a.category.localeCompare(b.category);
            return categoryCompare !== 0 ? categoryCompare : a.title.localeCompare(b.title);
        }
    });

    return (
        <div className="h-full overflow-y-auto p-8 max-w-7xl mx-auto custom-scrollbar">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="font-serif text-3xl text-watercolor-indigo font-bold flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-watercolor-teal" /> {labels.pillarsTitle}
                </h2>
                
                <div className="flex items-center gap-2 text-sm bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-wash-blue shadow-sm">
                    <ArrowDownAZ size={16} className="text-ink-light/60" />
                    <span className="text-ink-light/60 text-xs uppercase font-bold mr-2">{labels.sortBy}</span>
                    <button 
                        onClick={() => setSortMethod('category')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sortMethod === 'category' ? 'bg-watercolor-indigo text-white shadow-sm' : 'text-ink-light hover:bg-wash-blue'}`}
                    >
                        {labels.sortCategory}
                    </button>
                    <div className="w-px h-4 bg-ink-light/20"></div>
                    <button 
                        onClick={() => setSortMethod('title')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sortMethod === 'title' ? 'bg-watercolor-indigo text-white shadow-sm' : 'text-ink-light hover:bg-wash-blue'}`}
                    >
                        {labels.sortTitle}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {sortedPillars.map((pillar) => (
                <button 
                    key={pillar.id} 
                    onClick={() => onSelectPillar(pillar)}
                    disabled={isLoading}
                    className="text-left p-6 bg-white/70 backdrop-blur-sm border border-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:scale-[1.02] hover:border-watercolor-indigo/30 transition-all group relative h-full flex flex-col duration-300 disabled:opacity-50"
                >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                        <ArrowRight size={20} className="text-watercolor-indigo"/>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-watercolor-teal uppercase tracking-widest bg-wash-green px-2 py-1 rounded-md">{pillar.category}</span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-ink mb-3 group-hover:text-watercolor-indigo transition-colors">{pillar.title}</h3>
                    <p className="text-sm text-ink-light leading-relaxed flex-1 font-sans">{pillar.description}</p>
                    <div className="mt-4 text-xs text-watercolor-indigo/60 italic font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {labels.pillarPrompt}
                    </div>
                </button>
                ))}
            </div>
        </div>
    );
  };

  const renderVariations = () => (
    <div className="h-full overflow-y-auto p-8 max-w-6xl mx-auto custom-scrollbar">
         <div className="mb-8">
             <div className="flex items-center gap-2 text-sm text-ink-light mb-2">
                 <span className="font-bold uppercase tracking-widest text-watercolor-indigo/60">{labels.contextPillar}</span>
                 <span className="bg-white px-2 py-1 rounded-md border border-wash-blue">{selectedPillar?.title}</span>
             </div>
             <h2 className="font-serif text-3xl text-watercolor-rose font-bold flex items-center gap-3">
                <Layers className="w-8 h-8" /> {labels.variationsTitle}
             </h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {variations.map((v) => (
                 <button 
                    key={v.id} 
                    onClick={() => onSelectVariation(v)}
                    disabled={isLoading}
                    className="text-left bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-md hover:shadow-xl hover:shadow-rose-100 border border-white transition-all group relative flex flex-col disabled:opacity-50"
                >
                    <div className="flex items-center gap-2 mb-4">
                         <span className="px-3 py-1 bg-wash-red text-watercolor-rose rounded-full text-xs font-bold uppercase tracking-wide">
                             {v.angle}
                         </span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-ink mb-3 group-hover:text-watercolor-rose transition-colors">
                        {v.title}
                    </h3>
                    <p className="text-base text-ink-light leading-relaxed font-sans flex-1">
                        {v.description}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-bold text-watercolor-rose/80 opacity-0 group-hover:opacity-100 transition-opacity">
                         {labels.variationPrompt} <ArrowRight size={16} />
                    </div>
                </button>
            ))}
         </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="h-full overflow-y-auto p-8 max-w-5xl mx-auto custom-scrollbar">
         <div className="mb-8 space-y-2">
             <div className="flex flex-wrap items-center gap-2 text-sm text-ink-light">
                 <span className="font-bold uppercase tracking-widest text-watercolor-indigo/60">{labels.contextPillar}</span>
                 <span className="bg-white px-2 py-1 rounded-md border border-wash-blue mr-4">{selectedPillar?.title}</span>
                 
                 <span className="font-bold uppercase tracking-widest text-watercolor-rose/60">{labels.contextVariation}</span>
                 <span className="bg-white px-2 py-1 rounded-md border border-wash-blue">{selectedVariation?.title}</span>
             </div>
             <h2 className="font-serif text-3xl text-watercolor-teal font-bold flex items-center gap-3 pt-2">
                <HelpCircle className="w-8 h-8" /> {labels.questionsTitle}
             </h2>
         </div>

         <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-stone-200 border border-white overflow-hidden">
             <div className="divide-y divide-wash-blue">
                 {questions.map((q, idx) => (
                     <div key={q.id} className="p-6 hover:bg-wash-blue/20 transition-colors flex gap-4 group">
                         <div className="font-serif text-2xl font-bold text-watercolor-teal/40 group-hover:text-watercolor-teal transition-colors w-10 text-right shrink-0">
                             {idx + 1}.
                         </div>
                         <div>
                             <h4 className="text-lg font-medium text-ink mb-2 group-hover:text-watercolor-indigo transition-colors">
                                 {q.question}
                             </h4>
                             <div className="flex items-center gap-2">
                                 <CheckCircle2 size={14} className="text-watercolor-teal" />
                                 <span className="text-xs font-bold uppercase tracking-wider text-ink-light/70">{q.intent}</span>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
         
         <div className="mt-12 p-8 bg-gradient-to-br from-watercolor-blue/10 to-watercolor-teal/10 rounded-2xl border border-watercolor-teal/20 text-center">
             <p className="font-serif text-xl text-ink mb-4 italic">
                 {language === 'ko' ? "이 질문들은 청중이 검색하고 있는 실제 고민들입니다. 이 질문들에 답하는 콘텐츠를 만드세요." : "These are the questions your audience is actively asking. Build content that answers them."}
             </p>
         </div>
    </div>
  );

  return (
    <div className="h-full bg-watercolor-gradient flex flex-col">
      {renderNav()}
      <div className="flex-1 overflow-hidden relative">
        {isLoading && (
            <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md flex items-center gap-3 border border-wash-blue">
                <Loader2 className="animate-spin text-watercolor-indigo" size={18} />
                <span className="text-sm font-medium text-ink-light">
                    {language === 'ko' ? '생성 중...' : 'Generating Strategy...'}
                </span>
            </div>
        )}
        
        {currentView === 'HOME' && renderHome()}
        {currentView === 'PILLARS' && renderPillars()}
        {currentView === 'VARIATIONS' && renderVariations()}
        {currentView === 'QUESTIONS' && renderQuestions()}
      </div>
    </div>
  );
};

export default AuthorityMap;
