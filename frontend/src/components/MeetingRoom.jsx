import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Settings, 
  Download, 
  Copy, 
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import QueueDisplay from './queue/QueueDisplay';
import ProposalList from './proposals/ProposalList';
import useMeetingStore from '../store/meetingStore';

function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { 
    currentUser, 
    currentMeeting, 
    participants, 
    fetchMeeting, 
    fetchQueue,
    isLoading, 
    error 
  } = useMeetingStore();
  
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/setup?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (meetingId) {
      fetchMeeting(meetingId);
      fetchQueue(meetingId);
    }
  }, [meetingId, currentUser, navigate, fetchMeeting, fetchQueue]);

  const copyPin = async () => {
    if (currentMeeting?.pin) {
      try {
        await navigator.clipboard.writeText(currentMeeting.pin);
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      } catch (err) {
        console.error('Failed to copy PIN:', err);
      }
    }
  };

  const exportMeeting = (format) => {
    if (currentMeeting) {
      const url = `/api/meetings/${currentMeeting.id}/export?format=${format}`;
      window.open(url, '_blank');
    }
  };

  const getUserRole = () => {
    if (!currentUser || !participants) return 'OBSERVER';
    const participant = participants.find(p => p.userId === currentUser.id);
    return participant?.role || 'OBSERVER';
  };

  const userRole = getUserRole();
  const isFacilitator = userRole === 'FACILITATOR';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to Load Meeting
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    );
  }

  if (!currentMeeting) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Meeting Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The meeting you're looking for doesn't exist or has ended.
        </p>
        <Button onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Meeting Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{currentMeeting.title}</CardTitle>
              {currentMeeting.description && (
                <p className="text-gray-600 mt-2">{currentMeeting.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    currentMeeting.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {currentMeeting.isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {participants.length} participant{participants.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Started {new Date(currentMeeting.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Meeting PIN</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-bold">
                    {currentMeeting.pin}
                  </span>
                  <Button
                    onClick={copyPin}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {copiedPin ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Badge variant={userRole === 'FACILITATOR' ? 'default' : 'secondary'}>
                {userRole}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue">Speaking Queue</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <QueueDisplay 
            meetingId={meetingId}
            currentUser={currentUser}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <ProposalList 
            meetingId={meetingId}
            currentUser={currentUser}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div 
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{participant.user.displayName}</span>
                        {participant.user.pronouns && (
                          <span className="text-sm text-gray-500">
                            ({participant.user.pronouns})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{participant.role}</Badge>
                        <span className="text-xs text-gray-500">
                          Joined {new Date(participant.joinedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {participant.user.isAnonymous && (
                      <Badge variant="secondary" className="text-xs">
                        Anonymous
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Time per Speaker</h4>
                  <p className="text-sm text-gray-600">
                    {Math.floor(currentMeeting.settings.timePerSpeakerSec / 60)} minutes
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Direct Response Window</h4>
                  <p className="text-sm text-gray-600">
                    {currentMeeting.settings.directResponseWindowSec} seconds
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Max Direct Responses</h4>
                  <p className="text-sm text-gray-600">
                    {currentMeeting.settings.maxDirectResponsesPerUser} per 10 minutes
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Progressive Stack</h4>
                  <p className="text-sm text-gray-600">
                    {currentMeeting.settings.progressiveStack ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>

              {currentMeeting.settings.progressiveStack && 
               currentMeeting.settings.inviteTags?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Invite Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentMeeting.settings.inviteTags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Export Meeting Data</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={() => exportMeeting('markdown')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Markdown
                  </Button>
                  <Button
                    onClick={() => exportMeeting('csv')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MeetingRoom;

