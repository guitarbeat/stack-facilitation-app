import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hand, 
  MessageSquare, 
  Info, 
  AlertCircle, 
  HelpCircle,
  Clock,
  User,
  Crown,
  Eye
} from 'lucide-react';
import useMeetingStore from '../../store/meetingStore';

function QueueDisplay({ meetingId, currentUser, userRole }) {
  const { queue, currentSpeaker, addToQueue, removeFromQueue, error } = useMeetingStore();
  const [selectedTags, setSelectedTags] = useState([]);
  
  const canManageQueue = userRole === 'FACILITATOR' || userRole === 'STACK_KEEPER';
  
  const getQueueItemIcon = (type) => {
    switch (type) {
      case 'HAND':
        return <Hand className="h-4 w-4" />;
      case 'DIRECT_RESPONSE':
        return <MessageSquare className="h-4 w-4" />;
      case 'POINT_INFO':
        return <Info className="h-4 w-4" />;
      case 'POINT_PROCESS':
        return <AlertCircle className="h-4 w-4" />;
      case 'POINT_CLARIFICATION':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Hand className="h-4 w-4" />;
    }
  };

  const getQueueItemColor = (type) => {
    switch (type) {
      case 'HAND':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DIRECT_RESPONSE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'POINT_INFO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'POINT_PROCESS':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'POINT_CLARIFICATION':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'HAND':
        return 'Raise Hand';
      case 'DIRECT_RESPONSE':
        return 'Direct Response';
      case 'POINT_INFO':
        return 'Point of Information';
      case 'POINT_PROCESS':
        return 'Point of Process';
      case 'POINT_CLARIFICATION':
        return 'Point of Clarification';
      default:
        return type;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'FACILITATOR':
        return <Crown className="h-3 w-3 text-yellow-600" />;
      case 'OBSERVER':
        return <Eye className="h-3 w-3 text-gray-600" />;
      default:
        return <User className="h-3 w-3 text-blue-600" />;
    }
  };

  const handleAddToQueue = async (type) => {
    try {
      const metadata = selectedTags.length > 0 ? { tags: selectedTags } : {};
      await addToQueue(meetingId, currentUser.id, type, metadata);
      setSelectedTags([]);
    } catch (error) {
      console.error('Failed to add to queue:', error);
    }
  };

  const handleRemoveFromQueue = async (itemId) => {
    try {
      await removeFromQueue(meetingId, itemId, currentUser.id, 'User removed themselves');
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  };

  const userInQueue = queue.find(item => item.userId === currentUser?.id);

  return (
    <div className="space-y-4">
      {/* Current Speaker */}
      {currentSpeaker && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              Currently Speaking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {getRoleIcon(currentSpeaker.user.role)}
                  <span className="font-medium">{currentSpeaker.user.displayName}</span>
                </div>
                <Badge variant="outline" className={getQueueItemColor(currentSpeaker.type)}>
                  {getQueueItemIcon(currentSpeaker.type)}
                  <span className="ml-1">{getTypeLabel(currentSpeaker.type)}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Started {new Date(currentSpeaker.startedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Speaking Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Speaking Queue ({queue.length})</span>
            {queue.length > 0 && (
              <Badge variant="secondary">
                Next: {queue[0]?.user.displayName}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Hand className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No one in the speaking queue</p>
              <p className="text-sm">Raise your hand to join!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.slice(0, 10).map((item, index) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(item.user.role)}
                        <span className="font-medium">{item.user.displayName}</span>
                        {item.user.pronouns && (
                          <span className="text-sm text-gray-500">({item.user.pronouns})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getQueueItemColor(item.type)}>
                          {getQueueItemIcon(item.type)}
                          <span className="ml-1">{getTypeLabel(item.type)}</span>
                        </Badge>
                        {item.orderingReason && (
                          <span className="text-xs text-gray-500">
                            {item.orderingReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                    {(item.userId === currentUser?.id || canManageQueue) && (
                      <Button
                        onClick={() => handleRemoveFromQueue(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {queue.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ... and {queue.length - 10} more in queue
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Actions */}
      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Join Speaking Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {userInQueue ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-medium mb-2">
                  You are #{userInQueue.position} in the queue
                </p>
                <Badge className={getQueueItemColor(userInQueue.type)}>
                  {getQueueItemIcon(userInQueue.type)}
                  <span className="ml-1">{getTypeLabel(userInQueue.type)}</span>
                </Badge>
                <div className="mt-3">
                  <Button
                    onClick={() => handleRemoveFromQueue(userInQueue.id)}
                    variant="outline"
                    size="sm"
                  >
                    Leave Queue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => handleAddToQueue('HAND')}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <Hand className="h-4 w-4" />
                  Raise Hand
                </Button>
                
                <Button
                  onClick={() => handleAddToQueue('DIRECT_RESPONSE')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <MessageSquare className="h-4 w-4" />
                  Direct Response
                </Button>
                
                <Button
                  onClick={() => handleAddToQueue('POINT_INFO')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Info className="h-4 w-4" />
                  Point of Info
                </Button>
                
                <Button
                  onClick={() => handleAddToQueue('POINT_PROCESS')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <AlertCircle className="h-4 w-4" />
                  Point of Process
                </Button>
              </div>
            )}
            
            {error && (
              <div 
                className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default QueueDisplay;

