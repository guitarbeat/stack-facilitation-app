import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useMeetingStore from '../store/meetingStore';

function JoinMeeting() {
  const navigate = useNavigate();
  const { currentUser, joinMeeting, isLoading, error } = useMeetingStore();
  
  const [formData, setFormData] = useState({
    pin: '',
    role: 'PARTICIPANT'
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/setup?returnTo=/join');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.pin.trim()) {
      return;
    }

    try {
      const participant = await joinMeeting(
        formData.pin.toUpperCase(), 
        currentUser.id, 
        formData.role
      );
      
      navigate(`/meeting/${participant.meeting.id}`);
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPin = (value) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return cleaned.slice(0, 6); // Limit to 6 characters
  };

  if (!currentUser) {
    return null; // Will redirect to setup
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Join Meeting</CardTitle>
          <CardDescription>
            Enter the meeting PIN to join an existing meeting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pin">
                Meeting PIN <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pin"
                type="text"
                value={formData.pin}
                onChange={(e) => handleInputChange('pin', formatPin(e.target.value))}
                placeholder="Enter 6-character PIN"
                required
                maxLength={6}
                className="mt-1 text-center text-lg font-mono tracking-widest"
                aria-describedby="pin-help"
              />
              <p id="pin-help" className="text-xs text-gray-500 mt-1">
                The meeting PIN is provided by the meeting organizer
              </p>
            </div>

            <div>
              <Label htmlFor="role">Your Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PARTICIPANT">Participant</SelectItem>
                  <SelectItem value="OBSERVER">Observer</SelectItem>
                  <SelectItem value="STACK_KEEPER">Stack Keeper</SelectItem>
                  <SelectItem value="FACILITATOR">Facilitator</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-1">
                <p><strong>Participant:</strong> Can speak and vote</p>
                <p><strong>Observer:</strong> Can watch but not participate</p>
                <p><strong>Stack Keeper:</strong> Helps manage the speaking queue</p>
                <p><strong>Facilitator:</strong> Full meeting control</p>
              </div>
            </div>

            {error && (
              <div 
                className="text-sm text-red-600 bg-red-50 p-3 rounded"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !formData.pin.trim()}
            >
              {isLoading ? 'Joining Meeting...' : 'Join Meeting'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 text-center">
              Don't have a meeting PIN?{' '}
              <button
                onClick={() => navigate('/create')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Create a new meeting
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default JoinMeeting;

