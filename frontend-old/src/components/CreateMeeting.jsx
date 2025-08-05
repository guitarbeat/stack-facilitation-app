import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import useMeetingStore from '../store/meetingStore';

function CreateMeeting() {
  const navigate = useNavigate();
  const { currentUser, createMeeting, joinMeeting, isLoading, error } = useMeetingStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    settings: {
      progressiveStack: false,
      directResponseWindowSec: 30,
      maxDirectResponsesPerUser: 3,
      timePerSpeakerSec: 180,
      allowAnonymous: true,
      retentionDays: 30,
      inviteTags: []
    }
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/setup?returnTo=/create');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    try {
      const meeting = await createMeeting(
        formData.title, 
        formData.description, 
        formData.settings
      );
      
      // Join the meeting as facilitator
      await joinMeeting(meeting.pin, currentUser.id, 'FACILITATOR');
      
      navigate(`/meeting/${meeting.id}`);
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingChange = (setting, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  const addInviteTag = () => {
    if (newTag.trim() && !formData.settings.inviteTags.includes(newTag.trim())) {
      handleSettingChange('inviteTags', [...formData.settings.inviteTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeInviteTag = (tagToRemove) => {
    handleSettingChange('inviteTags', 
      formData.settings.inviteTags.filter(tag => tag !== tagToRemove)
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInviteTag();
    }
  };

  if (!currentUser) {
    return null; // Will redirect to setup
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Meeting</CardTitle>
          <CardDescription>
            Set up a new cooperative meeting with stack facilitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">
                  Meeting Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Monthly Co-op Planning Meeting"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the meeting purpose..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Meeting Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Meeting Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timePerSpeaker">Time per Speaker (seconds)</Label>
                  <Select 
                    value={formData.settings.timePerSpeakerSec.toString()} 
                    onValueChange={(value) => handleSettingChange('timePerSpeakerSec', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                      <SelectItem value="180">3 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="directResponseWindow">Direct Response Window (seconds)</Label>
                  <Select 
                    value={formData.settings.directResponseWindowSec.toString()} 
                    onValueChange={(value) => handleSettingChange('directResponseWindowSec', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxDirectResponses">Max Direct Responses per User (per 10 min)</Label>
                  <Select 
                    value={formData.settings.maxDirectResponsesPerUser.toString()} 
                    onValueChange={(value) => handleSettingChange('maxDirectResponsesPerUser', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="retentionDays">Data Retention (days)</Label>
                  <Select 
                    value={formData.settings.retentionDays.toString()} 
                    onValueChange={(value) => handleSettingChange('retentionDays', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowAnonymous"
                    checked={formData.settings.allowAnonymous}
                    onCheckedChange={(checked) => handleSettingChange('allowAnonymous', checked)}
                  />
                  <Label htmlFor="allowAnonymous" className="text-sm">
                    Allow anonymous participants
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="progressiveStack"
                    checked={formData.settings.progressiveStack}
                    onCheckedChange={(checked) => handleSettingChange('progressiveStack', checked)}
                  />
                  <Label htmlFor="progressiveStack" className="text-sm">
                    Enable Progressive Stack
                  </Label>
                </div>
              </div>
            </div>

            {/* Progressive Stack Tags */}
            {formData.settings.progressiveStack && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Progressive Stack Tags</h3>
                <p className="text-sm text-gray-600">
                  Define tags that participants can use to identify themselves for progressive stack priority. 
                  Examples: "new to group", "affected by decision", "rarely speaks"
                </p>
                
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1"
                  />
                  <Button type="button" onClick={addInviteTag} variant="outline">
                    Add
                  </Button>
                </div>

                {formData.settings.inviteTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.settings.inviteTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeInviteTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
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

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? 'Creating Meeting...' : 'Create Meeting'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateMeeting;

