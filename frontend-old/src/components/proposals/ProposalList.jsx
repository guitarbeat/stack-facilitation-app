import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  Minus,
  Clock,
  User
} from 'lucide-react';
import useMeetingStore from '../../store/meetingStore';

function ProposalList({ meetingId, currentUser, userRole }) {
  const { proposals, createProposal, voteOnProposal, error } = useMeetingStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: ''
  });

  const canCreateProposal = userRole !== 'OBSERVER';
  const canVote = userRole !== 'OBSERVER';

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    
    if (!newProposal.title.trim()) {
      return;
    }

    try {
      await createProposal(
        meetingId,
        currentUser.id,
        newProposal.title,
        newProposal.description
      );
      
      setNewProposal({ title: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  const handleVote = async (proposalId, voteType, rationale = '') => {
    try {
      await voteOnProposal(proposalId, currentUser.id, voteType, rationale);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const getProposalStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'PASSED':
        return 'bg-green-100 text-green-800';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVoteIcon = (voteType) => {
    switch (voteType) {
      case 'AGREE':
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'STAND_ASIDE':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      case 'CONCERN':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'BLOCK':
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getUserVote = (proposal) => {
    return proposal.votes?.find(vote => vote.userId === currentUser?.id);
  };

  const getVoteCounts = (proposal) => {
    const votes = proposal.votes || [];
    return {
      agree: votes.filter(v => v.voteType === 'AGREE').length,
      standAside: votes.filter(v => v.voteType === 'STAND_ASIDE').length,
      concern: votes.filter(v => v.voteType === 'CONCERN').length,
      block: votes.filter(v => v.voteType === 'BLOCK').length
    };
  };

  return (
    <div className="space-y-4">
      {/* Create Proposal */}
      {canCreateProposal && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Proposals</CardTitle>
              {!showCreateForm && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Proposal
                </Button>
              )}
            </div>
          </CardHeader>
          
          {showCreateForm && (
            <CardContent>
              <form onSubmit={handleCreateProposal} className="space-y-4">
                <div>
                  <Label htmlFor="proposalTitle">
                    Proposal Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="proposalTitle"
                    type="text"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="Brief, clear title for the proposal"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="proposalDescription">Description</Label>
                  <Textarea
                    id="proposalDescription"
                    value={newProposal.description}
                    onChange={(e) => setNewProposal(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder="Detailed description of what you're proposing..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={!newProposal.title.trim()}>
                    Create Proposal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewProposal({ title: '', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {/* Proposal List */}
      {proposals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              <Plus className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No proposals yet</p>
              {canCreateProposal && (
                <p className="text-sm">Create the first proposal to get started!</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const userVote = getUserVote(proposal);
            const voteCounts = getVoteCounts(proposal);
            const isActive = proposal.status === 'ACTIVE';
            
            return (
              <Card key={proposal.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{proposal.title}</CardTitle>
                        <Badge className={getProposalStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Proposed by {proposal.proposer.displayName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(proposal.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {proposal.description && (
                    <p className="text-gray-700 mt-3">{proposal.description}</p>
                  )}
                </CardHeader>

                <CardContent>
                  {/* Vote Counts */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span>{voteCounts.agree} Agree</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Minus className="h-4 w-4 text-yellow-600" />
                      <span>{voteCounts.standAside} Stand Aside</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span>{voteCounts.concern} Concerns</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span>{voteCounts.block} Blocks</span>
                    </div>
                  </div>

                  {/* User's Vote */}
                  {userVote && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        {getVoteIcon(userVote.voteType)}
                        <span className="font-medium">
                          Your vote: {userVote.voteType.replace('_', ' ')}
                        </span>
                      </div>
                      {userVote.rationale && (
                        <p className="text-sm text-gray-600 mt-1">
                          "{userVote.rationale}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Voting Buttons */}
                  {canVote && isActive && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button
                        onClick={() => handleVote(proposal.id, 'AGREE')}
                        variant={userVote?.voteType === 'AGREE' ? 'default' : 'outline'}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        Agree
                      </Button>
                      
                      <Button
                        onClick={() => handleVote(proposal.id, 'STAND_ASIDE')}
                        variant={userVote?.voteType === 'STAND_ASIDE' ? 'default' : 'outline'}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Minus className="h-3 w-3" />
                        Stand Aside
                      </Button>
                      
                      <Button
                        onClick={() => handleVote(proposal.id, 'CONCERN')}
                        variant={userVote?.voteType === 'CONCERN' ? 'default' : 'outline'}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Concern
                      </Button>
                      
                      <Button
                        onClick={() => handleVote(proposal.id, 'BLOCK')}
                        variant={userVote?.voteType === 'BLOCK' ? 'destructive' : 'outline'}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ThumbsDown className="h-3 w-3" />
                        Block
                      </Button>
                    </div>
                  )}

                  {/* Recent Votes */}
                  {proposal.votes && proposal.votes.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Recent Votes</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {proposal.votes
                          .slice()
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .slice(0, 5)
                          .map((vote) => (
                            <div key={vote.id} className="flex items-center gap-2 text-sm">
                              {getVoteIcon(vote.voteType)}
                              <span className="font-medium">{vote.user.displayName}</span>
                              <span className="text-gray-500">
                                {vote.voteType.replace('_', ' ').toLowerCase()}
                              </span>
                              {vote.rationale && (
                                <span className="text-gray-600 italic">
                                  "{vote.rationale}"
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {error && (
        <div 
          className="text-sm text-red-600 bg-red-50 p-3 rounded"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default ProposalList;

