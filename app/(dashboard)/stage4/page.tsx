'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';
import { Candidate, generateAIRecommendations, extractUserSummary } from '@/lib/ai-recommendations';

type MatchSnapshot = {
  phase: 'intro' | 'major' | 'university' | 'result';
  mode: 'major' | 'university';
  roundCandidates: Candidate[];
  nextRoundCandidates: Candidate[];
  matchIndex: number;
  round: number;
  majorWinner: Candidate | null;
  universityWinner: Candidate | null;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const TOTAL_ROUNDS = 3;

const getMatchReasons = (
  candidate: Candidate,
  mode: 'major' | 'university'
): string[] => {
  const reasons: string[] = [];

  if (mode === 'major') {
    if (candidate.matchPercent !== undefined) {
      reasons.push(`${candidate.matchPercent}% alignment`);
    }
    if (candidate.careers?.length) {
      reasons.push(`Career: ${candidate.careers[0]}`);
    }
    if (candidate.coreCourses?.length) {
      reasons.push(`Course: ${candidate.coreCourses[0]}`);
    }
  } else {
    if (candidate.internshipPipeline) {
      reasons.push(`Internships: ${candidate.internshipPipeline}`);
    }
    if (candidate.aidStrength) {
      reasons.push(`Financial aid: ${candidate.aidStrength}`);
    }
    if (candidate.selectivity) {
      reasons.push(`Selectivity: ${candidate.selectivity}`);
    }
  }

  return reasons.slice(0, 3);
};

export default function Stage4Page() {
  const [phase, setPhase] = useState<'intro' | 'major' | 'university' | 'result'>('intro');
  const [mode, setMode] = useState<'major' | 'university'>('major');
  const [roundCandidates, setRoundCandidates] = useState<Candidate[]>([]);
  const [nextRoundCandidates, setNextRoundCandidates] = useState<Candidate[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [majorWinner, setMajorWinner] = useState<Candidate | null>(null);
  const [universityWinner, setUniversityWinner] = useState<Candidate | null>(null);
  const [history, setHistory] = useState<MatchSnapshot[]>([]);
  const [personalizedMajors, setPersonalizedMajors] = useState<Candidate[]>([]);
  const [confidence, setConfidence] = useState(85);
  const [insightStrengths, setInsightStrengths] = useState<string[]>([]);
  const [insightRoles, setInsightRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSummary, setUserSummary] = useState<string>('');
  
  const router = useRouter();
  const { completeStage } = useUserStore();

  useEffect(() => {
    const initializeUserData = () => {
      const profile = getUserProfile();
      const summary = extractUserSummary(profile);
      
      // Ensure we have a valid summary
      if (summary && summary.trim().length > 0) {
        setUserSummary(summary);
      } else {
        // Fallback summary if profile is empty
        setUserSummary("Korean high school student exploring academic and career paths. Seeking personalized major and university recommendations.");
      }
      
      // Extract strengths for insights
      const strengthMap: Record<string, string> = {
        analytical: 'Analytical',
        creative: 'Creative',
        empathy: 'Empathy',
        organization: 'Organization',
      };
      
      const userStrengths = profile.strengthTags || [];
      const strengthLabels = userStrengths
        .map(strength => strengthMap[strength])
        .filter(Boolean)
        .slice(0, 3);
      
      setInsightStrengths(strengthLabels);
      
      // Extract liked roles for insights
      const likedRoles = profile.likedRoles || [];
      setInsightRoles(likedRoles.slice(0, 3));
    };
    
    initializeUserData();
  }, []);

  const startMajorTournament = async () => {
    setLoading(true);
    setError(null);
    
    // Ensure userSummary is available
    let summaryToUse = userSummary;
    if (!summaryToUse || summaryToUse.trim().length === 0) {
      const profile = getUserProfile();
      summaryToUse = extractUserSummary(profile);
      if (!summaryToUse || summaryToUse.trim().length === 0) {
        setError('Please complete earlier stages (Stage 0, 1, or 2) to generate personalized recommendations.');
        setLoading(false);
        return;
      }
      setUserSummary(summaryToUse);
    }
    
    try {
      const result = await generateAIRecommendations({
        userSummary: summaryToUse,
        type: 'major',
        count: 6 // Reduced from 8 for faster generation
      });
      
      if (result.success && result.recommendations.length > 0) {
        setPersonalizedMajors(result.recommendations);
        setPhase('major');
        setMode('major');
        setRoundCandidates(result.recommendations);
        setNextRoundCandidates([]);
        setMatchIndex(0);
        setRound(1);
        setHistory([]);
      } else {
        throw new Error(result.error || 'AI failed to generate major recommendations');
      }
    } catch (error) {
      console.error('Failed to start major tournament:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more helpful error messages
      let userFriendlyError = errorMessage;
      if (errorMessage.includes('API key')) {
        userFriendlyError = 'OpenAI API key is invalid or missing. Please check your .env.local file.';
      } else if (errorMessage.includes('rate limit')) {
        userFriendlyError = 'Too many requests. Please wait a moment and try again.';
      } else if (errorMessage.includes('timeout')) {
        userFriendlyError = 'Request took too long. Please try again.';
      }
      
      setError(`AI failed to generate recommendations: ${userFriendlyError}`);
    } finally {
      setLoading(false);
    }
  };

  const startUniversityTournament = async (major: Candidate) => {
    console.log('=== Starting University Tournament ===');
    console.log('Major:', major.name);
    console.log('Current phase:', phase);
    console.log('Current mode:', mode);
    
    setLoading(true);
    setError(null);
    
    // Set phase to university immediately to show loading state
    setPhase('university');
    setMode('university');
    console.log('Phase set to university, mode set to university');
    
    // Ensure userSummary is available
    let summaryToUse = userSummary;
    if (!summaryToUse || summaryToUse.trim().length === 0) {
      const profile = getUserProfile();
      summaryToUse = extractUserSummary(profile);
      if (!summaryToUse || summaryToUse.trim().length === 0) {
        console.error('No user summary available');
        setError('Please complete earlier stages to generate university recommendations.');
        setLoading(false);
        setPhase('major'); // Revert phase on error
        return;
      }
      setUserSummary(summaryToUse);
    }
    
    console.log('User summary length:', summaryToUse.length);
    console.log('Calling generateAIRecommendations...');
    
    try {
      const result = await generateAIRecommendations({
        userSummary: summaryToUse,
        type: 'university',
        currentMajor: major.name,
        count: 4 // Reduced from 5 for faster generation
      });
      
      console.log('API Result:', result);
      
      if (result.success && result.recommendations.length > 0) {
        console.log('University recommendations received:', result.recommendations.length);
        console.log('Sample university:', result.recommendations[0]);
        setRoundCandidates(result.recommendations);
        setNextRoundCandidates([]);
        setMatchIndex(0);
        setRound(1);
        console.log('University tournament initialized successfully');
      } else {
        console.error('University tournament failed:', result.error);
        throw new Error(result.error || 'AI failed to generate university recommendations');
      }
    } catch (error) {
      console.error('=== Failed to start university tournament ===');
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more helpful error messages
      let userFriendlyError = errorMessage;
      if (errorMessage.includes('API key')) {
        userFriendlyError = 'OpenAI API key is invalid or missing. Please check your .env.local file.';
      } else if (errorMessage.includes('rate limit')) {
        userFriendlyError = 'Too many requests. Please wait a moment and try again.';
      } else if (errorMessage.includes('timeout')) {
        userFriendlyError = 'Request took too long. Please try again.';
      }
      
      setError(`AI failed to generate university recommendations: ${userFriendlyError}`);
      setPhase('major'); // Revert phase on error
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  const resetTournament = () => {
    setPhase('intro');
    setMode('major');
    setRoundCandidates([]);
    setNextRoundCandidates([]);
    setMatchIndex(0);
    setRound(1);
    setMajorWinner(null);
    setUniversityWinner(null);
    setHistory([]);
    setError(null);
  };

  const handlePick = (winner: Candidate) => {
    const calculatedTotalMatches = Math.floor(roundCandidates.length / 2);
    console.log('handlePick called:', { mode, winner: winner.name, matchIndex, totalMatches: calculatedTotalMatches, candidatesCount: roundCandidates.length });
    
    setHistory((prev) => [
      ...prev,
      {
        phase,
        mode,
        roundCandidates: [...roundCandidates],
        nextRoundCandidates: [...nextRoundCandidates],
        matchIndex,
        round,
        majorWinner,
        universityWinner,
      },
    ]);

    const updatedWinners = [...nextRoundCandidates, winner];
    const totalMatches = Math.floor(roundCandidates.length / 2);
    const currentMatchNumber = matchIndex + 1;
    const hasUnpairedCandidate = roundCandidates.length % 2 === 1 && matchIndex === totalMatches - 1;
    const roundFinished = currentMatchNumber >= totalMatches;

    console.log('Tournament state:', { 
      updatedWinners: updatedWinners.length, 
      totalMatches, 
      currentMatchNumber,
      roundFinished, 
      hasUnpairedCandidate,
      mode,
      roundCandidatesLength: roundCandidates.length
    });

    // If round is not finished, continue to next match
    if (!roundFinished) {
      setNextRoundCandidates(updatedWinners);
      setMatchIndex(matchIndex + 1);
      return;
    }

    // Handle unpaired candidate (when odd number of candidates)
    if (hasUnpairedCandidate && roundCandidates.length > 2) {
      const unpairedCandidate = roundCandidates[roundCandidates.length - 1];
      updatedWinners.push(unpairedCandidate);
      console.log('Unpaired candidate added:', unpairedCandidate.name);
    }

    // Round is finished - check if we have a final winner
    console.log('Round finished check:', { 
      updatedWinnersLength: updatedWinners.length, 
      mode,
      isFinalWinner: updatedWinners.length === 1 
    });
    
    if (updatedWinners.length === 1) {
      if (mode === 'major') {
        console.log('✅ Major winner selected, starting university tournament:', updatedWinners[0].name);
        setMajorWinner(updatedWinners[0]);
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          console.log('🚀 Calling startUniversityTournament now');
          startUniversityTournament(updatedWinners[0]);
        }, 100);
      } else {
        console.log('✅ University winner selected, showing results');
        setUniversityWinner(updatedWinners[0]);
        setPhase('result');
      }
      return;
    }

    // Multiple winners remain - start next round
    console.log('Starting next round with', updatedWinners.length, 'candidates');
    setRoundCandidates(updatedWinners);
    setNextRoundCandidates([]);
    setMatchIndex(0);
    setRound(round + 1);
  };

  const handleUndo = () => {
    setHistory((prev) => {
      if (!prev.length) {
        return prev;
      }
      const snapshot = prev[prev.length - 1];
      setPhase(snapshot.phase);
      setMode(snapshot.mode);
      setRoundCandidates(snapshot.roundCandidates);
      setNextRoundCandidates(snapshot.nextRoundCandidates);
      setMatchIndex(snapshot.matchIndex);
      setRound(snapshot.round);
      setMajorWinner(snapshot.majorWinner);
      setUniversityWinner(snapshot.universityWinner);
      return prev.slice(0, -1);
    });
  };

  const handleComplete = () => {
    if (!majorWinner || !universityWinner) {
      return;
    }

    // Prepare the stage4Result according to your UserProfile type
    const stage4Result = {
      major: { 
        id: majorWinner.id, 
        name: majorWinner.name
      },
      university: { 
        id: universityWinner.id, 
        name: universityWinner.name
      },
      confidence,
      insightStrengths,
      insightRoles,
      completedAt: new Date().toISOString(),
    };

    // Update the user profile with the result
    updateUserProfile({ stage4Result });

    // Mark stage as complete
    completeStage(4);
    
    // Redirect to dashboard
    const dashboardPath = `${BASE_PATH}/dashboard`;
    router.push(dashboardPath);
  };

  const currentPair = roundCandidates.slice(matchIndex * 2, matchIndex * 2 + 2);
  const totalMatches = roundCandidates.length ? roundCandidates.length / 2 : 0;

  // Show loading state if loading OR if phase is university but no candidates yet
  if (loading || (phase === 'university' && roundCandidates.length === 0 && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/asset/Background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <div className="text-white text-center max-w-md px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="mt-4 text-lg font-medium">Generating your personalized recommendations</p>
          <p className="mt-2 text-sm text-white/80">This will only take a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 sm:p-10"
      style={{
        backgroundImage: 'url(/asset/Background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="relative max-w-6xl mx-auto">
        <div
          className="pointer-events-none absolute -top-12 -left-10 h-52 w-52 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, #FFFFFF 0%, #C7B9FF 60%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, #FFFFFF 0%, #F4A9C8 60%, transparent 70%)' }}
        />

        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80 mb-2">Stage 4: Tournament</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white drop-shadow mb-2">
            Choose Your Academic Path
          </h1>
          <p className="text-sm text-white/90 max-w-2xl mx-auto">
            Compare majors and universities in a fun tournament-style selection
          </p>
        </div>
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span
            className={`rounded-full px-4 py-1 text-slate-700 transition ${
              phase === 'major' || phase === 'intro'
                ? 'bg-white/60'
                : 'bg-white/30'
            }`}
          >
            Major Tournament
          </span>
          <span className="text-white/80">→</span>
          <span
            className={`rounded-full px-4 py-1 text-slate-700 transition ${
              phase === 'university' ? 'bg-white/60' : 'bg-white/30'
            }`}
          >
            University Tournament
          </span>
          <span className="text-white/80">→</span>
          <span
            className={`rounded-full px-4 py-1 text-slate-700 transition ${
              phase === 'result' ? 'bg-white/60' : 'bg-white/30'
            }`}
          >
            Final Results
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur border border-red-200 rounded-2xl">
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {phase === 'intro' && (
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 sm:p-10 text-center border border-white/60">
            <div className="mb-6">
              <img
                src={`${BASE_PATH}/asset/Stage_option.png`}
                alt="Tournament introduction"
                className="mx-auto h-40 w-full max-w-md rounded-3xl object-cover shadow-md"
                loading="lazy"
              />
            </div>
            <p className="text-gray-700 mb-6 text-base leading-relaxed">
              Based on your profile, we've prepared personalized recommendations. Select your favorites through quick comparisons.
            </p>
            
            <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">Your AI Profile Analysis:</h3>
              <p className="text-sm text-blue-700">{userSummary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
              <div className="border border-white/70 bg-white/70 rounded-2xl p-5 shadow-md">
                <h2 className="text-lg font-semibold mb-2 text-slate-800">
                  Major Tournament
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Compare 6 personalized major recommendations. Choose your favorites in quick matchups.
                </p>
              </div>
              <div className="border border-white/70 bg-white/70 rounded-2xl p-5 shadow-md">
                <h2 className="text-lg font-semibold mb-2 text-slate-800">
                  University Tournament
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  After selecting your major, compare 4 Korean universities. Find the best match for your goals.
                </p>
              </div>
            </div>
            
            <div className="text-xs text-slate-500 mb-4">
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                100% AI-Powered Recommendations
              </span>
            </div>
            
            <button
              onClick={startMajorTournament}
              disabled={loading}
              className="px-6 py-3 rounded-full font-medium text-slate-800 bg-white/90 shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI Processing...
                </span>
              ) : (
                'Start AI Tournament'
              )}
            </button>
          </div>
        )}

        {phase === 'university' && roundCandidates.length === 0 && !loading && error && (
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 sm:p-10 text-center border border-white/60">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setPhase('major');
                if (majorWinner) {
                  startUniversityTournament(majorWinner);
                }
              }}
              className="px-6 py-3 rounded-full font-medium text-slate-800 bg-white/90 shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 ease-out"
            >
              Try Again
            </button>
          </div>
        )}

        {(phase === 'major' || phase === 'university') && currentPair.length === 2 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  {mode === 'major' ? 'Major Tournament' : 'University Tournament'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white drop-shadow">
                  Round {round} of {TOTAL_ROUNDS}
                </h2>
                <p className="text-sm text-white/80">
                  Match {matchIndex + 1} of {totalMatches}
                </p>
              </div>
              <div className="text-sm text-slate-700 bg-white/20 border border-white/30 rounded-full px-4 py-1">
                {nextRoundCandidates.length} winners selected
              </div>
            </div>

            <div className="text-center text-white/90 text-base font-medium mb-2">
              Which option do you prefer?
            </div>
            <div className="text-center text-white/70 text-sm mb-4">
              Click on the option that better matches your interests and goals
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentPair.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handlePick(candidate)}
                  className="group text-left bg-white/85 backdrop-blur rounded-3xl shadow-xl p-6 border border-white/70 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">{candidate.name}</h3>
                      <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        AI-Powered Match
                      </span>
                    </div>
                    <span className="text-xs font-medium text-blue-600">
                      Select
                    </span>
                  </div>
                  
                  {mode === 'major' && candidate.matchPercent !== undefined && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">AI Match Score</span>
                        <span className="text-sm font-bold text-blue-600">{candidate.matchPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${candidate.matchPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">{candidate.summary}</p>
                  
                  {mode === 'major' && candidate.careers && candidate.careers.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">Potential Careers:</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.careers.slice(0, 3).map((career, index) => (
                          <span key={index} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                            {career}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {mode === 'major' && candidate.coreCourses && candidate.coreCourses.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-1">Key Courses:</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.coreCourses.slice(0, 3).map((course, index) => (
                          <span key={index} className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full">
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {mode === 'university' && candidate.location && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">Location:</p>
                      <p className="text-sm text-slate-600">{candidate.location}</p>
                    </div>
                  )}
                  
                  {mode === 'university' && candidate.scholarships && candidate.scholarships.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-1">Scholarship Opportunities:</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.scholarships.slice(0, 2).map((scholarship, index) => (
                          <span key={index} className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                            {scholarship}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {mode === 'university' && (
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      {candidate.tuitionRange && (
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <p className="text-slate-500">Tuition</p>
                          <p className="font-medium">{candidate.tuitionRange}</p>
                        </div>
                      )}
                      {candidate.selectivity && (
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <p className="text-slate-500">Selectivity</p>
                          <p className="font-medium">{candidate.selectivity}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-600 mb-2">
                      Why this matches you:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getMatchReasons(candidate, mode).map((reason, index) => (
                        <span
                          key={index}
                          className="text-xs text-slate-700 bg-white/70 border border-white/70 rounded-full px-3 py-1 shadow-sm"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {candidate.details && candidate.details.length > 0 && (
                    <ul className="text-sm text-slate-600 space-y-1 mb-4">
                      {candidate.details.slice(0, 3).map((detail, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <img
                    src={candidate.imageUrl}
                    alt={candidate.name}
                    loading="lazy"
                    className="mt-4 h-36 w-full rounded-2xl object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={resetTournament}
                className="rounded-full border border-white/60 bg-white/20 px-4 py-1 text-sm text-slate-700 shadow-sm transition hover:bg-white/35"
              >
                Restart
              </button>
              <button
                onClick={handleUndo}
                className="rounded-full border border-white/60 bg-white/25 px-4 py-1 text-sm text-slate-700 shadow-sm transition hover:bg-white/35 disabled:text-slate-400"
                disabled={history.length === 0}
              >
                Undo Last Choice
              </button>
              {majorWinner && mode === 'university' && (
                <div className="rounded-full border border-white/60 bg-white/20 px-4 py-1 text-sm text-slate-700 shadow-sm">
                  Major: {majorWinner.name}
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'result' && majorWinner && universityWinner && (
          <div className="relative overflow-hidden bg-white/85 backdrop-blur rounded-3xl shadow-2xl p-8 sm:p-10 text-center space-y-6 border border-white/60">
            <div className="confetti pointer-events-none absolute inset-0">
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={index}
                  style={{
                    left: `${(index + 1) * 5}%`,
                    animationDelay: `${(index % 6) * 0.12}s`,
                    ['--drift' as string]: `${(index % 2 === 0 ? 1 : -1) * (20 + index * 2)}vw`,
                    ['--spin' as string]: `${120 + index * 20}deg`,
                    background:
                      index % 3 === 0
                        ? '#C7B9FF'
                        : index % 3 === 1
                          ? '#F4A9C8'
                          : '#9BCBFF',
                  }}
                />
              ))}
            </div>
            <div>
              <img
                src={`${BASE_PATH}/asset/Stage_evolve.png`}
                alt="Final results celebration"
                className="mx-auto h-36 w-full max-w-md rounded-3xl object-cover shadow-md"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Final Results
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800">
                Your Winning Path
              </h2>
            </div>
            
            <div className="bg-green-50/70 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">AI-Powered Perfect Match!</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-white/70 bg-white/70 rounded-2xl p-5 text-left shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Selected Major
                  </p>
                  {majorWinner.matchPercent && (
                    <span className="text-sm font-bold text-blue-600">{majorWinner.matchPercent}% match</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{majorWinner.name}</h3>
                <p className="text-sm text-slate-600 mt-2">{majorWinner.summary}</p>
                
                {majorWinner.careers && majorWinner.careers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">Top Career Paths:</p>
                    <div className="flex flex-wrap gap-1">
                      {majorWinner.careers.slice(0, 3).map((career, index) => (
                        <span key={index} className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="border border-white/70 bg-white/70 rounded-2xl p-5 text-left shadow-md">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Selected University
                </p>
                <h3 className="text-lg font-semibold text-slate-800">{universityWinner.name}</h3>
                <p className="text-sm text-slate-600 mt-2">{universityWinner.summary}</p>
                
                {universityWinner.location && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-500">Location</p>
                    <p className="text-sm text-slate-700">{universityWinner.location}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white/70 border border-white/70 rounded-2xl p-5 text-left shadow-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">
                Your Academic Path
              </p>
              <p className="text-sm text-slate-700">
                {majorWinner.name} at {universityWinner.name}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                {majorWinner.summary} · {universityWinner.summary}
              </p>
            </div>
            
            {(insightStrengths.length > 0 || insightRoles.length > 0) && (
              <div className="bg-white/70 border border-white/70 rounded-2xl p-5 text-left shadow-md">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">
                  AI Insights
                </p>
                {insightStrengths.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-slate-700 mb-1">
                      Based on your strengths: {insightStrengths.join(', ')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {insightStrengths.map((strength, index) => (
                        <span key={index} className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {insightRoles.length > 0 && (
                  <p className="text-sm text-slate-700 mt-2">
                    Linked to your liked roles: {insightRoles.join(', ')}
                  </p>
                )}
              </div>
            )}
            
            <div className="bg-white/70 border border-white/70 rounded-2xl p-5 text-left shadow-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">
                Your Confidence Level
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">Low</span>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={confidence}
                  onChange={(event) => setConfidence(Number(event.target.value))}
                  className="w-full accent-[#9BCBFF]"
                />
                <span className="text-xs text-slate-500">High</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Confidence: {confidence}%
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleComplete}
                className="px-6 py-3 rounded-full font-medium text-slate-800 bg-white/90 shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 ease-out"
              >
                Save & Return to Dashboard
              </button>
              <button
                onClick={resetTournament}
                className="px-6 py-3 rounded-full border border-white/70 text-slate-700 bg-white/70 hover:bg-white/90 shadow-md transition-all duration-300 ease-out"
              >
                Run Another Tournament
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .confetti span {
          position: absolute;
          top: -8%;
          width: 10px;
          height: 18px;
          opacity: 0.85;
          border-radius: 6px;
          animation: confetti-burst 2.4s ease-out infinite;
        }

        @keyframes confetti-burst {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.9);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) translateX(var(--drift)) rotate(var(--spin)) scale(0.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}