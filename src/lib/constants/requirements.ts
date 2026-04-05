/** Each student must upload one file per key before requesting a physician match. */
export const REQUIRED_STUDENT_DOCUMENTS: { key: string; label: string; description: string }[] =
  [
    {
      key: "liability_waiver",
      label: "Liability / program waiver",
      description: "Signed waiver from your school or program, if applicable."
    },
    {
      key: "hipaa_orientation",
      label: "HIPAA / privacy orientation",
      description: "Certificate or confirmation of privacy training."
    },
    {
      key: "school_authorization",
      label: "School authorization letter",
      description: "Letter or email from your pre‑health office authorizing shadowing outreach."
    }
  ];

export const REQUIRED_DOCUMENT_KEYS = REQUIRED_STUDENT_DOCUMENTS.map((d) => d.key);
