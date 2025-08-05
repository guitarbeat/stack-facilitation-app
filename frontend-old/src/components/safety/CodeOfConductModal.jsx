import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle } from 'lucide-react';
import FocusManager from '../accessibility/FocusManager';

function CodeOfConductModal({ 
  isOpen, 
  onOpenChange, 
  onAccept, 
  required = false,
  trigger = null 
}) {
  const [hasRead, setHasRead] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleAccept = () => {
    setHasAccepted(true);
    if (onAccept) {
      onAccept();
    }
    onOpenChange(false);
  };

  const codeOfConduct = {
    title: "Community Code of Conduct",
    lastUpdated: "2024-01-01",
    sections: [
      {
        title: "Our Commitment",
        content: `We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, color, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.`
      },
      {
        title: "Our Standards",
        content: `Examples of behavior that contributes to a positive environment include:

• Demonstrating empathy and kindness toward other people
• Being respectful of differing opinions, viewpoints, and experiences
• Giving and gracefully accepting constructive feedback
• Accepting responsibility and apologizing to those affected by our mistakes
• Focusing on what is best not just for us as individuals, but for the overall community
• Using welcoming and inclusive language
• Respecting the time and contributions of all participants

Examples of unacceptable behavior include:

• The use of sexualized language or imagery, and sexual attention or advances of any kind
• Trolling, insulting or derogatory comments, and personal or political attacks
• Public or private harassment
• Publishing others' private information without their explicit permission
• Interrupting or talking over others consistently
• Making assumptions about others' identities, experiences, or motivations
• Other conduct which could reasonably be considered inappropriate in a professional setting`
      },
      {
        title: "Enforcement Responsibilities",
        content: `Meeting facilitators are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

Facilitators have the right and responsibility to remove, edit, or reject comments, contributions, and other participation that are not aligned with this Code of Conduct, and will communicate reasons for moderation decisions when appropriate.`
      },
      {
        title: "Scope",
        content: `This Code of Conduct applies within all meeting spaces, and also applies when an individual is officially representing the community in public spaces. Examples of representing our community include using an official e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event.`
      },
      {
        title: "Reporting",
        content: `Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the meeting facilitators or through the incident reporting system. All complaints will be reviewed and investigated promptly and fairly.

All facilitators are obligated to respect the privacy and security of the reporter of any incident.`
      },
      {
        title: "Enforcement Guidelines",
        content: `Facilitators will follow these Community Impact Guidelines in determining the consequences for any action they deem in violation of this Code of Conduct:

**1. Correction**
Community Impact: Use of inappropriate language or other behavior deemed unprofessional or unwelcome.
Consequence: A private, written warning providing clarity around the nature of the violation and an explanation of why the behavior was inappropriate.

**2. Warning**
Community Impact: A violation through a single incident or series of actions.
Consequence: A warning with consequences for continued behavior, including temporary restrictions on participation.

**3. Temporary Ban**
Community Impact: A serious violation of community standards, including sustained inappropriate behavior.
Consequence: A temporary ban from any sort of interaction or public communication with the community for a specified period of time.

**4. Permanent Ban**
Community Impact: Demonstrating a pattern of violation of community standards, including sustained inappropriate behavior, harassment of an individual, or aggression toward or disparagement of classes of individuals.
Consequence: A permanent ban from any sort of public interaction within the community.`
      },
      {
        title: "Attribution",
        content: `This Code of Conduct is adapted from the Contributor Covenant, version 2.1, available at https://www.contributor-covenant.org/version/2/1/code_of_conduct.html.

Community Impact Guidelines were inspired by Mozilla's code of conduct enforcement ladder.`
      }
    ]
  };

  const ModalContent = () => (
    <FocusManager autoFocus trapFocus>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {codeOfConduct.title}
        </DialogTitle>
        <DialogDescription>
          Last updated: {codeOfConduct.lastUpdated}
          {required && (
            <span className="block mt-2 text-amber-600 font-medium">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              You must read and accept this Code of Conduct to participate.
            </span>
          )}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="h-96 w-full pr-4">
        <div className="space-y-6">
          {codeOfConduct.sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                {section.title}
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="hasRead"
            checked={hasRead}
            onCheckedChange={setHasRead}
            aria-describedby="hasRead-description"
          />
          <div className="grid gap-1.5 leading-none">
            <label 
              htmlFor="hasRead"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I have read and understand this Code of Conduct
            </label>
            <p id="hasRead-description" className="text-xs text-gray-500">
              Please confirm that you have read the entire Code of Conduct above
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {!required && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
          <Button
            onClick={handleAccept}
            disabled={!hasRead}
            className="min-w-24"
          >
            {required ? 'Accept & Continue' : 'Accept'}
          </Button>
        </div>
      </div>
    </FocusManager>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <ModalContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <ModalContent />
      </DialogContent>
    </Dialog>
  );
}

export default CodeOfConductModal;

