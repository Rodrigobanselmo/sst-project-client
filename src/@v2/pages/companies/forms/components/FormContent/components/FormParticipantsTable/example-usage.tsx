// Example of how to integrate the FormParticipantsTable as a new tab
import React from 'react';
import { FormParticipantsTable } from './FormParticipantsTable';

// This would be used in a tab component or similar
export const FormParticipantsTabExample = () => {
  const companyId = 'your-company-id';
  const applicationId = 'your-application-id';

  return (
    <div>
      <h2>Form Participants</h2>
      <FormParticipantsTable 
        companyId={companyId}
        applicationId={applicationId}
      />
    </div>
  );
};

// Example of how to add this to existing tabs structure
export const TabsWithParticipants = () => {
  return (
    <div>
      {/* Your existing tabs */}
      <div role="tabpanel">
        <FormParticipantsTable 
          companyId="company-123"
          applicationId="app-456"
        />
      </div>
    </div>
  );
};
