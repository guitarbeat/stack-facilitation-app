import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Shield, Lock } from 'lucide-react';
import FocusManager from '../accessibility/FocusManager';

function IncidentReportModal({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  meetingId,
  currentUser,
  trigger = null 
}) {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    anonymous: false,
    urgent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const incidentTypes = [
    { value: 'harassment', label: 'Harassment or discrimination' },
    { value: 'disruption', label: 'Disruptive behavior' },
    { value: 'violation', label: 'Code of Conduct violation' },
    { value: 'technical', label: 'Technical abuse or misuse' },
    { value: 'privacy', label: 'Privacy violation' },
    { value: 'other', label: 'Other concern' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        meetingId,
        reporterId: formData.anonymous ? null : currentUser?.id,
        type: formData.type,
        description: formData.description,
        urgent: formData.urgent,
        anonymous: formData.anonymous,
        timestamp: new Date().toISOString()
      };

      // Submit to backend
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit incident report');
      }

      setSubmitted(true);
      
      if (onSubmit) {
        onSubmit(reportData);
      }

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          type: '',
          description: '',
          anonymous: false,
          urgent: false
        });
        setSubmitted(false);
        onOpenChange(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to submit incident report:', error);
      alert('Failed to submit report. Please try again or contact a facilitator directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ModalContent = () => {
    if (submitted) {
      return (
        <FocusManager autoFocus>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Report Submitted
            </h3>
            <p className="text-gray-600 mb-4">
              Your incident report has been submitted and will be reviewed by the meeting facilitators.
            </p>
            <p className="text-sm text-gray-500">
              This dialog will close automatically in a few seconds.
            </p>
          </div>
        </FocusManager>
      );
    }

    return (
      <FocusManager autoFocus trapFocus>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Report an Incident
          </DialogTitle>
          <DialogDescription>
            Use this form to report violations of our Code of Conduct or other concerning behavior.
            All reports are taken seriously and will be handled confidentially.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="incidentType">
              Type of Incident <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange('type', value)}
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select the type of incident" />
              </SelectTrigger>
              <SelectContent>
                {incidentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please describe what happened, including relevant context and any specific behaviors or statements that were concerning..."
              rows={6}
              required
              className="mt-1"
              aria-describedby="description-help"
            />
            <p id="description-help" className="text-xs text-gray-500 mt-1">
              Be as specific as possible. Include timestamps, usernames, and exact quotes if relevant.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.anonymous}
                onCheckedChange={(checked) => handleInputChange('anonymous', checked)}
                aria-describedby="anonymous-help"
              />
              <div className="grid gap-1.5 leading-none">
                <label 
                  htmlFor="anonymous"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Submit anonymously
                </label>
                <p id="anonymous-help" className="text-xs text-gray-500">
                  Your identity will not be shared with anyone, including facilitators
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="urgent"
                checked={formData.urgent}
                onCheckedChange={(checked) => handleInputChange('urgent', checked)}
                aria-describedby="urgent-help"
              />
              <div className="grid gap-1.5 leading-none">
                <label 
                  htmlFor="urgent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  This is urgent
                </label>
                <p id="urgent-help" className="text-xs text-gray-500">
                  Check this if immediate action is needed to ensure safety
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              What happens next?
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Your report will be reviewed by meeting facilitators</li>
              <li>• Appropriate action will be taken based on our enforcement guidelines</li>
              <li>• You may be contacted for additional information (unless anonymous)</li>
              <li>• All reports are kept confidential to the extent possible</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.type || !formData.description.trim() || isSubmitting}
              className="min-w-24"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </FocusManager>
    );
  };

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <ModalContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <ModalContent />
      </DialogContent>
    </Dialog>
  );
}

export default IncidentReportModal;

