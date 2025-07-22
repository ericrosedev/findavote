import React from 'react';
import { Heart, Coffee, Code } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About FindaVote</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">
            FindaVote is a community-driven platform designed to help ICP SNS DAO participants discover and share 
            voting methodologies, values, and neuron addresses for following. Our mission is to make governance 
            participation more accessible and organized within the Internet Computer ecosystem.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <Coffee className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Built with caffeine.ai</h3>
              <p className="text-gray-700">
                This application was created during the Caffeine.ai launch event hackathon in San Francisco on July 15th 2025, and worked on by a team of non-developers for the World Computer Hacker League 2025 hackathon. Caffeine is an AI-powered development platform that enables rapid creation of decentralized applications on the Internet Computer.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <Code className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Open & Transparent</h3>
              <p className="text-gray-700">
                Built on the Internet Computer blockchain, FindaVote operates with full transparency. 
                All posts and user interactions are stored on-chain and publicly verifiable.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Free to Use
            </h3>
            <p className="text-gray-700 mb-3">
              FindaVote is completely free to use. You can create and browse posts about ICP SNS DAO participation, 
              voting methodologies, and neuron addresses without any fees or charges. Our goal is to make governance 
              participation as accessible as possible for everyone in the community.
            </p>
            <p className="text-gray-700">
              The platform is hosted on the Internet Computer, which provides a decentralized and 
              sustainable infrastructure for the application.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mt-1">
                  1
                </div>
                <div>
                  <h4 className="how-it-works-title font-medium text-gray-900">Discover</h4>
                  <p className="text-gray-700">Browse the latest ICP SNS DAO participation methodologies and neuron addresses to follow.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mt-1">
                  2
                </div>
                <div>
                  <h4 className="how-it-works-title font-medium text-gray-900">Share</h4>
                  <p className="text-gray-700">Create posts about your voting values, methodologies, and share your neuron addresses for others to follow.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mt-1">
                  3
                </div>
                <div>
                  <h4 className="how-it-works-title font-medium text-gray-900">Participate</h4>
                  <p className="text-gray-700">Follow trusted neurons and stay informed about important governance decisions in the ICP SNS DAO ecosystem.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Guidelines</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Posts should be relevant to ICP SNS DAO participation and voting methodologies</li>
              <li>Provide accurate information about your voting values and neuron addresses</li>
              <li>Be respectful and constructive in all interactions</li>
              <li>Avoid spam, duplicate posts, or misleading information</li>
              <li>Posts deemed inappropriate may be removed by administrators</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}