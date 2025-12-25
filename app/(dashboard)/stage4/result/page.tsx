'use client';

import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/userProfile';
import Link from 'next/link';

interface Stage4Result {
  major: { id: string; name: string };
  university: { id: string; name: string };
  confidence: number;
  insightStrengths: string[];
  insightRoles: string[];
  completedAt: string;
}

export default function Stage4ResultPage() {
  const [result, setResult] = useState<Stage4Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile.stage4Result) {
      setResult(profile.stage4Result);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Stage 4 Results Found</h1>
          <p className="text-gray-600 mb-6">
            Complete Stage 4 Tournament to see your personalized academic path recommendations.
          </p>
          <Link
            href="/stage4"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Stage 4 Tournament
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Your Academic Path Report</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered recommendations based on your profile, strengths, and interests
          </p>
          <div className="inline-flex items-center mt-4 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
            <span className="text-sm text-gray-500">Generated on </span>
            <span className="ml-1 text-sm font-medium text-gray-700">
              {new Date(result.completedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{result.confidence}%</div>
              <div className="text-sm font-medium text-gray-500">Confidence Score</div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full -z-10 blur-md opacity-60"></div>
          </div>
        </div>

        {/* Main Results Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* Major Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6l9-5M12 20l-9-5" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recommended Major</h2>
                <p className="text-sm text-gray-500">Based on your academic profile</p>
              </div>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">{result.major.name}</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Why This Major Fits You:</h4>
                <ul className="space-y-2">
                  {result.insightStrengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Expected Outcomes:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Career Alignment</div>
                    <div className="font-semibold text-gray-900">High</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Skill Growth</div>
                    <div className="font-semibold text-gray-900">Strong</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* University Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recommended University</h2>
                <p className="text-sm text-gray-500">Optimized for your major</p>
              </div>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">{result.university.name}</h3>
            
            <div className="space-y-4">
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-2">Key Advantages:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Strong Program</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Industry Ties</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Research Focus</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Global Network</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Location & Support:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Country</div>
                    <div className="font-semibold text-gray-900">South Korea</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Student Support</div>
                    <div className="font-semibold text-gray-900">Excellent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Path Banner */}
        <div className="relative mb-10 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Your Complete Academic Journey</h2>
            <div className="text-4xl font-bold text-white mb-6">
              {result.major.name} <span className="text-white/80 mx-4">at</span> {result.university.name}
            </div>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              A perfect match combining your academic interests with optimal learning environment
            </p>
          </div>
        </div>

        {/* Insights & Analysis */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">AI Analysis & Insights</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Strengths Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                Your Core Strengths
              </h3>
              <div className="space-y-3">
                {result.insightStrengths.map((strength, index) => (
                  <div key={index} className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-800">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Career Interests */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Related Career Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.insightRoles.map((role, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 rounded-full border border-green-200 hover:border-green-300 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {role}
                  </span>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">AI Confidence Analysis</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{result.confidence}%</span>
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  Based on profile alignment, historical data, and success metrics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Steps */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-8 text-center">Recommended Next Steps</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Research Program Details</h3>
              <p className="text-gray-300 text-sm">
                Explore course requirements, faculty, and specialization options for {result.major.name}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Financial Planning</h3>
              <p className="text-gray-300 text-sm">
                Investigate scholarships, tuition costs, and living expenses at {result.university.name}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect & Network</h3>
              <p className="text-gray-300 text-sm">
                Reach out to current students, alumni, and academic advisors for insights
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/stage4"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Run Another Tournament
          </Link>
          
          <button className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all shadow hover:shadow-md">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF Report
          </button>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all shadow hover:shadow-md"
          >
            Return to Dashboard
          </Link>
        </div>

        {/* Watermark */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Generated by Mirae.ai • AI-powered academic path recommendation
          </p>
        </div>
      </div>
    </div>
  );
}