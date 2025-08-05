import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Clock, Trash2, Download } from 'lucide-react';

function PrivacySettings({ 
  currentUser, 
  currentMeeting, 
  onUpdateSettings,
  userRole 
}) {
  const [settings, setSettings] = useState({
    // User privacy settings
    showPronouns: true,
    allowDirectMessages: true,
    shareParticipationHistory: false,
    
    // Meeting privacy settings (facilitator only)
    allowAnonymousParticipants: true,
    recordMeeting: false,
    shareQueueHistory: true,
    dataRetentionDays: 30,
    
    // Visibility settings
    showUserRoles: true,
    showJoinTimes: false,
    showVotingHistory: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const isFacilitator = userRole === 'FACILITATOR';

  useEffect(() => {
    // Load current settings
    if (currentUser) {
      // Load user privacy preferences
      const userSettings = currentUser.privacySettings || {};
      setSettings(prev => ({
        ...prev,
        ...userSettings
      }));
    }

    if (currentMeeting && isFacilitator) {
      // Load meeting privacy settings
      const meetingSettings = currentMeeting.settings || {};
      setSettings(prev => ({
        ...prev,
        allowAnonymousParticipants: meetingSettings.allowAnonymous,
        dataRetentionDays: meetingSettings.retentionDays,
        recordMeeting: meetingSettings.recordMeeting || false,
        shareQueueHistory: meetingSettings.shareQueueHistory !== false,
        showUserRoles: meetingSettings.showUserRoles !== false,
        showJoinTimes: meetingSettings.showJoinTimes || false,
        showVotingHistory: meetingSettings.showVotingHistory !== false
      }));
    }
  }, [currentUser, currentMeeting, isFacilitator]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Save user privacy settings
      const userSettings = {
        showPronouns: settings.showPronouns,
        allowDirectMessages: settings.allowDirectMessages,
        shareParticipationHistory: settings.shareParticipationHistory
      };

      await fetch(`/api/users/${currentUser.id}/privacy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacySettings: userSettings })
      });

      // Save meeting settings if facilitator
      if (isFacilitator && currentMeeting) {
        const meetingSettings = {
          ...currentMeeting.settings,
          allowAnonymous: settings.allowAnonymousParticipants,
          retentionDays: settings.dataRetentionDays,
          recordMeeting: settings.recordMeeting,
          shareQueueHistory: settings.shareQueueHistory,
          showUserRoles: settings.showUserRoles,
          showJoinTimes: settings.showJoinTimes,
          showVotingHistory: settings.showVotingHistory
        };

        await fetch(`/api/meetings/${currentMeeting.id}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: meetingSettings })
        });
      }

      if (onUpdateSettings) {
        onUpdateSettings(settings);
      }

      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/users/${currentUser.id}/export`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${currentUser.id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleDeleteData = async () => {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    try {
      await fetch(`/api/users/${currentUser.id}`, {
        method: 'DELETE'
      });

      alert('Your data has been scheduled for deletion. You will be logged out.');
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete data:', error);
      alert('Failed to delete data. Please contact support.');
    }
  };

  return (
    <div className="space-y-6">
      {/* User Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Personal Privacy Settings
          </CardTitle>
          <CardDescription>
            Control how your information is displayed to other participants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showPronouns">Show my pronouns</Label>
              <p className="text-sm text-gray-500">
                Display your pronouns next to your name
              </p>
            </div>
            <Switch
              id="showPronouns"
              checked={settings.showPronouns}
              onCheckedChange={(checked) => handleSettingChange('showPronouns', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowDirectMessages">Allow direct messages</Label>
              <p className="text-sm text-gray-500">
                Let other participants send you private messages
              </p>
            </div>
            <Switch
              id="allowDirectMessages"
              checked={settings.allowDirectMessages}
              onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="shareParticipationHistory">Share participation history</Label>
              <p className="text-sm text-gray-500">
                Allow facilitators to see your speaking patterns across meetings
              </p>
            </div>
            <Switch
              id="shareParticipationHistory"
              checked={settings.shareParticipationHistory}
              onCheckedChange={(checked) => handleSettingChange('shareParticipationHistory', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Meeting Privacy Settings (Facilitator Only) */}
      {isFacilitator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Meeting Privacy Settings
            </CardTitle>
            <CardDescription>
              Control privacy and data handling for this meeting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowAnonymousParticipants">Allow anonymous participants</Label>
                <p className="text-sm text-gray-500">
                  Let people join without providing identifying information
                </p>
              </div>
              <Switch
                id="allowAnonymousParticipants"
                checked={settings.allowAnonymousParticipants}
                onCheckedChange={(checked) => handleSettingChange('allowAnonymousParticipants', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="recordMeeting">Record meeting</Label>
                <p className="text-sm text-gray-500">
                  Save audio/video recordings (requires participant consent)
                </p>
              </div>
              <Switch
                id="recordMeeting"
                checked={settings.recordMeeting}
                onCheckedChange={(checked) => handleSettingChange('recordMeeting', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="dataRetention">Data retention period</Label>
              <Select 
                value={settings.dataRetentionDays.toString()} 
                onValueChange={(value) => handleSettingChange('dataRetentionDays', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Meeting data will be automatically deleted after this period
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Visibility Settings</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showUserRoles" className="text-sm">Show user roles</Label>
                <Switch
                  id="showUserRoles"
                  checked={settings.showUserRoles}
                  onCheckedChange={(checked) => handleSettingChange('showUserRoles', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showJoinTimes" className="text-sm">Show join times</Label>
                <Switch
                  id="showJoinTimes"
                  checked={settings.showJoinTimes}
                  onCheckedChange={(checked) => handleSettingChange('showJoinTimes', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showVotingHistory" className="text-sm">Show voting history</Label>
                <Switch
                  id="showVotingHistory"
                  checked={settings.showVotingHistory}
                  onCheckedChange={(checked) => handleSettingChange('showVotingHistory', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export or delete your personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Export your data</Label>
              <p className="text-sm text-gray-500">
                Download a copy of all your data in JSON format
              </p>
            </div>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-red-600">Delete all data</Label>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              onClick={handleDeleteData}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="min-w-24"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default PrivacySettings;

