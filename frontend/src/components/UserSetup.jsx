import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import useMeetingStore from '../store/meetingStore';

function UserSetup() {
  const navigate = useNavigate();
  const { createAnonymousUser, isLoading, error } = useMeetingStore();
  
  const [formData, setFormData] = useState({
    displayName: '',
    pronouns: '',
    consentToRecording: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.displayName.trim()) {
      return;
    }

    try {
      await createAnonymousUser(formData.displayName, formData.pronouns);
      
      // Redirect to the page they came from or home
      const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/';
      navigate(returnTo);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Set Up Your Profile</CardTitle>
          <CardDescription>
            Tell us how you'd like to be identified in meetings. All fields are optional 
            except display name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="displayName">
                Display Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="How should we address you?"
                required
                aria-describedby="displayName-help"
                className="mt-1"
              />
              <p id="displayName-help" className="text-xs text-gray-500 mt-1">
                This is how other participants will see you in the meeting
              </p>
            </div>

            <div>
              <Label htmlFor="pronouns">Pronouns (Optional)</Label>
              <Input
                id="pronouns"
                type="text"
                value={formData.pronouns}
                onChange={(e) => handleInputChange('pronouns', e.target.value)}
                placeholder="e.g., they/them, she/her, he/him"
                aria-describedby="pronouns-help"
                className="mt-1"
              />
              <p id="pronouns-help" className="text-xs text-gray-500 mt-1">
                Help others address you respectfully
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="consentToRecording"
                checked={formData.consentToRecording}
                onCheckedChange={(checked) => handleInputChange('consentToRecording', checked)}
                aria-describedby="consent-help"
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="consentToRecording"
                  className="text-sm font-normal cursor-pointer"
                >
                  I consent to meeting recordings (if any)
                </Label>
                <p id="consent-help" className="text-xs text-gray-500">
                  Some meetings may be recorded for note-taking purposes
                </p>
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
              disabled={isLoading || !formData.displayName.trim()}
            >
              {isLoading ? 'Setting up...' : 'Continue'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Privacy Notice
            </h4>
            <p className="text-xs text-gray-600">
              We collect minimal data needed to run meetings. Your information is not shared 
              with third parties and is automatically deleted based on meeting retention settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserSetup;

