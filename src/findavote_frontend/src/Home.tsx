import React from 'react';
import { Vote, Users, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Vote className="h-16 w-16 text-blue-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to FindaVote
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover and share ICP SNS DAO participation opportunities
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-800">
            FindaVote is a platform where users can create and browse posts about ICP SNS DAO participation, 
            detailing voting values and methodologies, and share neuron addresses for following.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
          <p className="text-gray-600">
            Built by the community, for the community. Share and discover ICP SNS DAO participation opportunities together.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Trusted</h3>
          <p className="text-gray-600">
            Built on Internet Computer with Internet Identity authentication for maximum security.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Free to Use</h3>
          <p className="text-gray-600">
            Create and browse posts completely free. No fees, no charges - just pure community collaboration.
          </p>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Browse Posts</h3>
              <p className="text-gray-600">
                Explore user posts about how they vote in ICP SNS DAO participation on our Find page.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Share Your Methodology</h3>
              <p className="text-gray-600">
                Share your voting values, methodologies, and neuron addresses with the community. Simply log in and start posting - it's completely free!
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Follow & Participate</h3>
              <p className="text-gray-600">
                Follow like-minded voters and never miss important voting decisions in the ICP SNS DAO ecosystem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}